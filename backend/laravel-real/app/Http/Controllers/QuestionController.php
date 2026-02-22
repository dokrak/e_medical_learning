<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;
use App\Models\QuestionImage;
use App\Models\AuditLog;
use App\Models\PatientMetadata;
use Illuminate\Support\Facades\Storage;

class QuestionController extends Controller
{
    private function isAdmin(Request $request): bool
    {
        try {
            return (bool) $request->user()?->hasRole('admin');
        } catch (\Throwable $e) {
            return false;
        }
    }

    public function myQuestions(Request $request){
        $user = $request->user();
        $query = Question::with('images');
        if (!$user->hasRole('admin')) {
            $query = $query->where('author_id', $user->id);
        }
        $questions = $query->orderByDesc('id')
            ->get()
            ->map(function (Question $question) {
                $payload = $question->toArray();
                $payload['answerExplanation'] = $question->answer_explanation;
                $payload['moderationFeedback'] = $question->moderation_feedback;
                $payload['specialtyId'] = $question->specialty_id ?? null;
                $payload['subspecialtyId'] = $question->subspecialty_id ?? null;
                $payload['images'] = $question->images
                    ->map(fn($image) => Storage::disk('public')->url($image->path))
                    ->values();
                return $payload;
            })
            ->values();
        return response()->json($questions);
    }

    public function index(Request $request){
        $query = Question::query()->where('status','approved');
        if ($request->filled('specialtyId')) {
            $query->where('specialty_id', $request->query('specialtyId'));
        }
        if ($request->filled('subspecialtyId')) {
            $query->where('subspecialty_id', $request->query('subspecialtyId'));
        }
        if ($request->has('tag')) { $query->whereHas('tags', fn($q)=>$q->where('name', $request->query('tag'))); }

        if ($request->filled('limit')) {
            $limit = (int) $request->query('limit', 0);
            if ($limit > 0) {
                $query->limit(min($limit, 500));
            }
        }

        return response()->json($query->get());
    }

    public function show($id){
        $q = Question::with('images')->findOrFail($id);
        return response()->json($q);
    }

    public function store(Request $request){
        // use gate to verify role (avoid missing policy issues)
        if (!$request->user()->can('create-question')) {
            return response()->json(['error'=>'forbidden'],403);
        }

        $data = $request->validate([
            'title'=>'required', 'stem'=>'nullable', 'body'=>'nullable', 'answer_explanation'=>'nullable|string', 'answerExplanation'=>'nullable|string', 'difficulty'=>'integer|min:1|max:5', 'answer'=>'nullable', 'references'=>'nullable|array', 'choices'=>'nullable|array', 'images'=>'nullable|array', 'specialtyId'=>'nullable|integer|exists:specialties,id', 'subspecialtyId'=>'nullable|integer|exists:specialties,id'
        ]);

        if (array_key_exists('answerExplanation', $data) && !array_key_exists('answer_explanation', $data)) {
            $data['answer_explanation'] = $data['answerExplanation'];
        }
        unset($data['answerExplanation']);

        $question = Question::create(array_merge($data, [
            'status'=>'pending',
            'author_id'=>$request->user()->id,
            'specialty_id'=>$data['specialtyId'] ?? null,
            'subspecialty_id'=>$data['subspecialtyId'] ?? null,
        ]));

        // store base64 images (dev only)
        if (!empty($data['images'])){
            foreach($data['images'] as $i => $b64){
                if (str_starts_with($b64, 'data:')) {
                    [$meta,$body] = explode(',', $b64, 2);
                    $ext = preg_match('/image\/(\w+)/',$meta,$m) ? $m[1] : 'jpg';
                    $imgPath = 'questions/'.now()->format('Ymd').'/'.uniqid().'.'.$ext;
                    Storage::disk('public')->put($imgPath, base64_decode($body));
                    QuestionImage::create(['question_id'=>$question->id,'path'=>$imgPath]);
                }
            }
        }

        // patient metadata placeholder
        PatientMetadata::create(['question_id'=>$question->id,'consent_obtained'=>false,'deidentified'=>false]);

        AuditLog::create(['entity'=>'question','entity_id'=>$question->id,'action'=>'create','user_id'=>$request->user()->id]);

        return response()->json($question,201);
    }

    public function update(Request $request, int $id)
    {
        $question = Question::with('images')->findOrFail($id);

        if ((int) $question->author_id !== (int) $request->user()->id && !$this->isAdmin($request)) {
            return response()->json(['error' => 'forbidden'], 403);
        }

        $data = $request->validate([
            'title'=>'required', 'stem'=>'nullable', 'body'=>'nullable', 'answer_explanation'=>'nullable|string', 'answerExplanation'=>'nullable|string', 'difficulty'=>'integer|min:1|max:5', 'answer'=>'nullable', 'references'=>'nullable|array', 'choices'=>'nullable|array', 'images'=>'nullable|array', 'specialtyId'=>'nullable|integer|exists:specialties,id', 'subspecialtyId'=>'nullable|integer|exists:specialties,id'
        ]);

        if (array_key_exists('answerExplanation', $data) && !array_key_exists('answer_explanation', $data)) {
            $data['answer_explanation'] = $data['answerExplanation'];
        }
        unset($data['answerExplanation']);

        $question->fill([
            'title' => $data['title'] ?? $question->title,
            'stem' => $data['stem'] ?? $question->stem,
            'body' => $data['body'] ?? $question->body,
            'answer_explanation' => $data['answer_explanation'] ?? $question->answer_explanation,
            'difficulty' => $data['difficulty'] ?? $question->difficulty,
            'answer' => $data['answer'] ?? $question->answer,
            'references' => $data['references'] ?? $question->references,
            'choices' => $data['choices'] ?? $question->choices,
            'specialty_id' => $data['specialtyId'] ?? null,
            'subspecialty_id' => $data['subspecialtyId'] ?? null,
            'status' => 'pending',
        ]);
        $question->save();

        AuditLog::create(['entity'=>'question','entity_id'=>$question->id,'action'=>'update','user_id'=>$request->user()->id]);

        return response()->json($question);
    }

    public function destroy(Request $request, int $id)
    {
        $question = Question::findOrFail($id);

        if ((int) $question->author_id !== (int) $request->user()->id && !$this->isAdmin($request)) {
            return response()->json(['error' => 'forbidden'], 403);
        }

        $question->delete();
        AuditLog::create(['entity'=>'question','entity_id'=>$id,'action'=>'delete','user_id'=>$request->user()->id]);
        return response()->json(['ok' => true]);
    }
}
