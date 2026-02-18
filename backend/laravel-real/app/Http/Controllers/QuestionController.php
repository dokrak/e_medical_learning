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
    public function index(Request $request){
        $query = Question::query()->where('status','approved');
        if ($request->has('tag')) { $query->whereHas('tags', fn($q)=>$q->where('name', $request->query('tag'))); }
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
            'title'=>'required', 'stem'=>'nullable', 'body'=>'nullable', 'answer_explanation'=>'nullable|string', 'answerExplanation'=>'nullable|string', 'difficulty'=>'integer|min:1|max:5', 'answer'=>'nullable', 'references'=>'nullable|array', 'choices'=>'nullable|array', 'images'=>'nullable|array'
        ]);

        if (array_key_exists('answerExplanation', $data) && !array_key_exists('answer_explanation', $data)) {
            $data['answer_explanation'] = $data['answerExplanation'];
        }
        unset($data['answerExplanation']);

        $question = Question::create(array_merge($data, ['status'=>'pending','author_id'=>$request->user()->id]));

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
}
