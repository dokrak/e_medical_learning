<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exam;
use App\Models\StudentExam;
use App\Models\Question;
use App\Models\QuestionStat;
use App\Models\User;

class StudentExamController extends Controller
{
    private function isStaff(Request $request): bool
    {
        try {
            return (bool) $request->user()?->hasAnyRole(['admin', 'clinician', 'moderator']);
        } catch (\Throwable $e) {
            return false;
        }
    }

    private function buildStatsPayload(int $studentId): array
    {
        $attemptModels = StudentExam::with('exam')
            ->where('student_id', $studentId)
            ->orderByDesc('created_at')
            ->get();

        $attempts = $attemptModels->map(function (StudentExam $attempt) {
            return [
                'id' => $attempt->id,
                'examId' => $attempt->exam_id,
                'examTitle' => $attempt->exam?->title ?? 'Exam #'.$attempt->exam_id,
                'score' => (float) $attempt->score,
                'taken_at' => optional($attempt->created_at)->toIso8601String(),
            ];
        })->values();

        $scores = $attemptModels->pluck('score')->map(fn ($score) => (float) $score)->values();
        $count = $scores->count();

        $avgScore = $count > 0 ? (float) round($scores->avg(), 2) : 0;
        $bestScore = $count > 0 ? (float) $scores->max() : 0;
        $lastScore = $count > 0 ? (float) $scores->first() : null;

        $improvement = 0;
        if ($count >= 2) {
            $chronological = $scores->reverse()->values();
            $half = (int) floor($count / 2);
            if ($half > 0) {
                $firstHalfAvg = (float) $chronological->slice(0, $half)->avg();
                $secondHalfAvg = (float) $chronological->slice($half)->avg();
                $improvement = (float) round($secondHalfAvg - $firstHalfAvg, 2);
            }
        }

        $perExam = $attemptModels
            ->groupBy('exam_id')
            ->map(function ($group) {
                $groupScores = $group->pluck('score')->map(fn ($score) => (float) $score);
                $first = $group->first();

                return [
                    'title' => $first?->exam?->title ?? 'Exam #'.$first?->exam_id,
                    'attempts' => $group->count(),
                    'avg' => (float) round($groupScores->avg() ?? 0, 2),
                ];
            })
            ->values();

        return [
            'studentId' => $studentId,
            'attempts' => $attempts,
            'avgScore' => $avgScore,
            'bestScore' => $bestScore,
            'lastScore' => $lastScore,
            'improvement' => $improvement,
            'perExam' => $perExam,
        ];
    }

    public function myStats(Request $request)
    {
        return response()->json($this->buildStatsPayload((int) $request->user()->id));
    }

    public function studentStats(Request $request, int $studentId)
    {
        if (!(bool) User::where('id', $studentId)->exists()) {
            return response()->json(['error' => 'student not found'], 404);
        }

        $viewer = $request->user();
        $isOwner = (int) $viewer->id === (int) $studentId;
        $isStaff = false;
        try {
            $isStaff = (bool) $viewer->hasAnyRole(['admin', 'clinician', 'moderator']);
        } catch (\Throwable $e) {
            $isStaff = false;
        }

        if (!$isOwner && !$isStaff) {
            return response()->json(['error' => 'forbidden'], 403);
        }

        return response()->json($this->buildStatsPayload($studentId));
    }

    public function index(Request $request){
        return response()->json(StudentExam::where('student_id',$request->user()->id)->get());
    }

    public function allStudentExams(Request $request)
    {
        $user = $request->user();
        if (!$this->isStaff($request) && !$user->hasRole('admin')) {
            return response()->json(['error' => 'forbidden'], 403);
        }
        $results = StudentExam::with(['exam', 'student'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (StudentExam $attempt) {
                return [
                    'id' => $attempt->id,
                    'examId' => $attempt->exam_id,
                    'examTitle' => $attempt->exam?->title ?? ('Exam #'.$attempt->exam_id),
                    'studentId' => $attempt->student_id,
                    'studentName' => $attempt->student?->name ?? ('Student #'.$attempt->student_id),
                    'studentEmail' => $attempt->student?->email,
                    'score' => (float) $attempt->score,
                    'taken_at' => optional($attempt->created_at)->toIso8601String(),
                ];
            })
            ->values();
        return response()->json($results);
    }

    public function examResults(Request $request, int $examId)
    {
        $user = $request->user();
        if (!$this->isStaff($request) && !$user->hasRole('admin')) {
            return response()->json(['error' => 'forbidden'], 403);
        }
        $exam = Exam::with('questions')->findOrFail($examId);
        $examQuestions = $exam->questions->values();
        $results = StudentExam::with('student')
            ->where('exam_id', $examId)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (StudentExam $attempt) use ($examQuestions) {
                $answers = collect($attempt->answers ?? []);
                $correct = $examQuestions->filter(function ($question) use ($answers) {
                    $studentAnswer = data_get(
                        $answers->firstWhere('questionId', $question->id),
                        'answer',
                        ''
                    );
                    return trim(strtolower((string) $studentAnswer)) === trim(strtolower((string) $question->answer));
                })->count();
                return [
                    'id' => $attempt->id,
                    'studentId' => $attempt->student_id,
                    'studentName' => $attempt->student?->name ?? ('Student #'.$attempt->student_id),
                    'studentEmail' => $attempt->student?->email,
                    'score' => (float) $attempt->score,
                    'correct' => $correct,
                    'total' => $examQuestions->count(),
                    'taken_at' => optional($attempt->created_at)->toIso8601String(),
                    'answers' => $attempt->answers ?? [],
                    'questions' => $examQuestions->map(function ($question) {
                        return [
                            'id' => $question->id,
                            'title' => $question->title,
                            'stem' => $question->stem,
                            'choices' => $question->choices,
                            'answer' => $question->answer,
                        ];
                    })->values(),
                ];
            })
            ->values();
        return response()->json($results);
    }

    public function submit(Request $request, $examId){
        $data = $request->validate(['answers'=>'required|array']);
        $exam = Exam::with('questions')->findOrFail($examId);
        $questions = $exam->questions;
        $correct = 0;
        foreach($data['answers'] as $ans){
            $q = $questions->firstWhere('id', $ans['questionId']);
            if (!$q) continue;
            if (trim(strtolower($ans['answer'])) === trim(strtolower($q->answer))) $correct++;

            // update simple stats
            $stat = QuestionStat::firstOrCreate(['question_id'=>$q->id], ['attempts'=>0,'corrects'=>0]);
            $stat->attempts++;
            if (trim(strtolower($ans['answer'])) === trim(strtolower($q->answer))) $stat->corrects++;
            $stat->difficulty_estimate = ($stat->attempts>0) ? (1 - ($stat->corrects / $stat->attempts)) * 5 : $stat->difficulty_estimate;
            $stat->save();
        }
        $score = round(($correct / $questions->count()) * 100, 2);
        $se = StudentExam::create(['exam_id'=>$exam->id,'student_id'=>$request->user()->id,'answers'=>$data['answers'],'score'=>$score]);
        return response()->json(['score'=>$score,'total'=>$questions->count(),'correct'=>$correct]);
    }
}
