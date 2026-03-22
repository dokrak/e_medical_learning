<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * GET /api/questions — approved questions, optional filters
     */
    public function index(Request $request)
    {
        $query = Question::where('status', 'approved');

        if ($request->filled('specialtyId')) {
            $query->where('specialty_id', $request->specialtyId);
        }
        if ($request->filled('subspecialtyId')) {
            $query->where('subspecialty_id', $request->subspecialtyId);
        }

        $results = $query->get();

        if ($request->filled('limit') && (int) $request->limit > 0) {
            $results = $results->take((int) $request->limit);
        }

        return response()->json($results->map(fn($q) => $this->formatQuestion($q))->values());
    }

    /**
     * POST /api/questions — create (clinician/admin)
     */
    public function store(Request $request)
    {
        $q = Question::create([
            'title' => $request->input('title', '(no title)'),
            'stem' => $request->input('stem', ''),
            'body' => $request->input('body', ''),
            'answer_explanation' => $request->input('answerExplanation', ''),
            'difficulty' => $request->input('difficulty', 3),
            'answer' => $request->input('answer', ''),
            'choices' => array_slice($request->input('choices', []), 0, 5),
            'references' => $request->input('references', []),
            'images' => $request->input('images', []),
            'specialty_id' => $request->input('specialtyId'),
            'subspecialty_id' => $request->input('subspecialtyId'),
            'status' => 'pending',
            'moderation_feedback' => null,
            'author_id' => $request->user()->id,
        ]);

        return response()->json($this->formatQuestion($q));
    }

    /**
     * GET /api/pending-questions — (admin/moderator)
     */
    public function pending()
    {
        return response()->json(
            Question::where('status', 'pending')->get()->map(fn($q) => $this->formatQuestion($q))->values()
        );
    }

    /**
     * GET /api/my-questions — current user's questions
     */
    public function mine(Request $request)
    {
        return response()->json(
            Question::where('author_id', $request->user()->id)->get()->map(fn($q) => $this->formatQuestion($q))->values()
        );
    }

    /**
     * GET /api/all-questions — all questions (any status) with author name
     */
    public function all(Request $request)
    {
        $users = \App\Models\User::all()->keyBy('id');
        return response()->json(
            Question::all()->map(function ($q) use ($users) {
                $data = $this->formatQuestion($q);
                $author = $users->get($q->author_id);
                $data['authorName'] = $author ? $author->name : 'Unknown';
                return $data;
            })->values()
        );
    }

    /**
     * POST /api/questions/{id}/approve
     */
    public function approve(string $id, Request $request)
    {
        $q = Question::findOrFail($id);
        $q->update(['status' => 'approved', 'moderation_feedback' => null]);

        AuditLog::create([
            'entity' => 'question',
            'entity_id' => $id,
            'action' => 'approve',
            'user_id' => $request->user()->id,
        ]);

        return response()->json($this->formatQuestion($q));
    }

    /**
     * POST /api/questions/{id}/reject
     */
    public function reject(string $id, Request $request)
    {
        $q = Question::findOrFail($id);
        $feedback = is_string($request->input('feedback')) ? trim($request->input('feedback')) : '';
        $q->update(['status' => 'rejected', 'moderation_feedback' => $feedback]);

        AuditLog::create([
            'entity' => 'question',
            'entity_id' => $id,
            'action' => 'reject',
            'user_id' => $request->user()->id,
            'detail' => $feedback,
        ]);

        return response()->json($this->formatQuestion($q));
    }

    /**
     * PUT /api/questions/{id}
     */
    public function update(string $id, Request $request)
    {
        $q = Question::findOrFail($id);
        $user = $request->user();

        if ($q->author_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['error' => 'can only edit your own questions'], 403);
        }

        $fields = ['title', 'stem', 'body', 'difficulty', 'answer'];
        foreach ($fields as $f) {
            if ($request->has($f)) $q->$f = $request->input($f);
        }
        if ($request->has('answerExplanation')) $q->answer_explanation = $request->input('answerExplanation');
        if ($request->has('references')) $q->references = $request->input('references');
        if ($request->has('images')) $q->images = $request->input('images');
        if ($request->has('choices')) $q->choices = $request->input('choices');
        if ($request->has('specialtyId')) $q->specialty_id = $request->input('specialtyId');
        if ($request->has('subspecialtyId')) $q->subspecialty_id = $request->input('subspecialtyId');

        $wasRejected = $q->status === 'rejected';
        if ($wasRejected) {
            $q->status = 'pending';
            $q->moderation_feedback = null;
        }

        $q->save();

        AuditLog::create([
            'entity' => 'question',
            'entity_id' => $id,
            'action' => $wasRejected ? 'resubmit' : 'edit',
            'user_id' => $user->id,
        ]);

        return response()->json($this->formatQuestion($q));
    }

    /**
     * DELETE /api/questions/{id}
     */
    public function destroy(string $id, Request $request)
    {
        $q = Question::findOrFail($id);
        $user = $request->user();

        if ($q->author_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['error' => 'can only delete your own questions'], 403);
        }

        $q->delete();

        AuditLog::create([
            'entity' => 'question',
            'entity_id' => $id,
            'action' => 'delete',
            'user_id' => $user->id,
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Format question for JSON response (camelCase keys matching mock API)
     */
    private function formatQuestion(Question $q): array
    {
        return [
            'id' => $q->id,
            'title' => $q->title,
            'stem' => $q->stem,
            'body' => $q->body,
            'answerExplanation' => $q->answer_explanation,
            'difficulty' => $q->difficulty,
            'answer' => $q->answer,
            'choices' => $q->choices ?? [],
            'references' => $q->references ?? [],
            'images' => collect($q->images ?? [])->filter(fn($img) => $img && $img !== '/api/files/' && $img !== '/storage/' && strlen($img) > 15)->values(),
            'specialtyId' => $q->specialty_id,
            'subspecialtyId' => $q->subspecialty_id,
            'status' => $q->status,
            'moderationFeedback' => $q->moderation_feedback,
            'authorId' => $q->author_id,
            'createdBy' => $q->author_id,
        ];
    }
}
