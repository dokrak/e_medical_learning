<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Storage;

class ModeratorController extends Controller
{
    public function pending(){
        $questions = Question::with('images')
            ->where('status', 'pending')
            ->orderByDesc('id')
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

    public function approve(Request $request, $id){
        $q = Question::findOrFail($id);
        $q->status = 'approved';
        $q->moderation_feedback = null;
        $q->save();
        AuditLog::create(['entity'=>'question','entity_id'=>$q->id,'action'=>'approve','user_id'=>$request->user()->id]);
        return response()->json($q);
    }

    public function reject(Request $request, $id){
        $q = Question::findOrFail($id);
        $data = $request->validate([
            'feedback' => 'nullable|string|max:5000'
        ]);

        $q->status = 'rejected';
        $q->moderation_feedback = $data['feedback'] ?? null;
        $q->save();

        AuditLog::create(['entity'=>'question','entity_id'=>$q->id,'action'=>'reject','user_id'=>$request->user()->id]);
        return response()->json($q);
    }
}
