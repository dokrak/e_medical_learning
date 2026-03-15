<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Question;
use App\Models\StudentExam;
use App\Models\User;
use Illuminate\Http\Request;

class StudentExamController extends Controller
{
    /**
     * POST /api/student-exams/{examId}/submit
     */
    public function submit(string $examId, Request $request)
    {
        $exam = Exam::findOrFail($examId);
        $answers = $request->input('answers', []); // [{ questionId, answer }]
        $questions = Question::whereIn('id', $exam->questions ?? [])->get()->keyBy('id');

        $correct = 0;
        foreach ($answers as $a) {
            $q = $questions->get($a['questionId'] ?? '');
            if (!$q) continue;
            if (strtolower(trim($a['answer'] ?? '')) === strtolower(trim($q->answer ?? ''))) {
                $correct++;
            }
        }

        $total = count($exam->questions ?? []);
        $score = $total > 0 ? (int) round(($correct / $total) * 100) : 0;
        $passingScore = $exam->passing_score ?? 50;
        $passed = $score >= $passingScore;

        $se = StudentExam::create([
            'exam_id' => $examId,
            'student_id' => $request->user()->id,
            'answers' => $answers,
            'score' => $score,
            'passed' => $passed,
            'total' => $total,
            'correct' => $correct,
            'passing_score' => $passingScore,
            'taken_at' => now(),
        ]);

        return response()->json([
            'score' => $score,
            'total' => $total,
            'correct' => $correct,
            'passed' => $passed,
            'passingScore' => $passingScore,
            'resultId' => $se->id,
        ]);
    }

    /**
     * GET /api/student-exams — current user's exams
     */
    public function index(Request $request)
    {
        $list = StudentExam::where('student_id', $request->user()->id)->get();
        return response()->json($list);
    }

    /**
     * GET /api/all-student-exams — admin/clinician/moderator
     */
    public function all()
    {
        $studentExams = StudentExam::all();
        $exams = Exam::all()->keyBy('id');
        $users = User::all()->keyBy('id');
        $questions = Question::all()->keyBy('id');

        $results = $studentExams->map(function ($se) use ($exams, $users, $questions) {
            $exam = $exams->get($se->exam_id);
            $student = $users->get($se->student_id);
            $examQuestions = $exam ? $questions->whereIn('id', $exam->questions ?? []) : collect();

            $correct = 0;
            foreach ($se->answers ?? [] as $a) {
                $q = $examQuestions->firstWhere('id', $a['questionId'] ?? '');
                if ($q && strtolower(trim($a['answer'] ?? '')) === strtolower(trim($q->answer ?? ''))) {
                    $correct++;
                }
            }

            return [
                'id' => $se->id,
                'examId' => $se->exam_id,
                'examTitle' => $exam?->title,
                'studentId' => $se->student_id,
                'studentName' => $student?->name,
                'studentEmail' => $student?->email,
                'score' => $se->score,
                'correct' => $correct,
                'total' => $examQuestions->count(),
                'taken_at' => $se->taken_at,
            ];
        });

        return response()->json($results->values());
    }

    /**
     * GET /api/exam-results/{examId} — results for a specific exam
     */
    public function examResults(string $examId)
    {
        $exam = Exam::findOrFail($examId);
        $examQuestions = Question::whereIn('id', $exam->questions ?? [])->get()->keyBy('id');
        $studentExams = StudentExam::where('exam_id', $examId)->get();
        $users = User::all()->keyBy('id');

        $results = $studentExams->map(function ($se) use ($examQuestions, $users) {
            $student = $users->get($se->student_id);
            $correct = 0;
            foreach ($se->answers ?? [] as $a) {
                $q = $examQuestions->get($a['questionId'] ?? '');
                if ($q && strtolower(trim($a['answer'] ?? '')) === strtolower(trim($q->answer ?? ''))) {
                    $correct++;
                }
            }

            return [
                'id' => $se->id,
                'studentId' => $se->student_id,
                'studentName' => $student?->name,
                'studentEmail' => $student?->email,
                'score' => $se->score,
                'correct' => $correct,
                'total' => $examQuestions->count(),
                'answers' => $se->answers,
                'questions' => $examQuestions->values()->map(fn($q) => [
                    'id' => $q->id,
                    'title' => $q->title,
                    'stem' => $q->stem,
                    'body' => $q->body,
                    'answerExplanation' => $q->answer_explanation,
                    'difficulty' => $q->difficulty,
                    'answer' => $q->answer,
                    'choices' => $q->choices ?? [],
                    'references' => $q->references ?? [],
                    'images' => $q->images ?? [],
                    'specialtyId' => $q->specialty_id,
                    'subspecialtyId' => $q->subspecialty_id,
                    'status' => $q->status,
                    'authorId' => $q->author_id,
                ]),
                'taken_at' => $se->taken_at,
            ];
        });

        return response()->json($results->values());
    }

    /**
     * GET /api/my-stats
     */
    public function myStats(Request $request)
    {
        return $this->buildStats($request->user()->id);
    }

    /**
     * GET /api/student-stats/{studentId}
     */
    public function studentStats(string $studentId, Request $request)
    {
        $user = $request->user();
        if ($user->id != $studentId && !in_array($user->role, ['admin', 'clinician', 'moderator'])) {
            return response()->json(['error' => 'forbidden'], 403);
        }

        return $this->buildStats($studentId);
    }

    /**
     * GET /api/student-exams/{resultId}/pdf — simplified JSON-based report (no PDFKit)
     */
    public function pdf(string $resultId, Request $request)
    {
        $se = StudentExam::findOrFail($resultId);
        $user = $request->user();

        if ($se->student_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['error' => 'not your exam'], 403);
        }

        $exam = Exam::find($se->exam_id);
        $student = User::find($se->student_id);
        $questions = Question::whereIn('id', $exam?->questions ?? [])->get()->keyBy('id');

        $breakdown = collect($se->answers ?? [])->map(function ($ans, $i) use ($questions) {
            $q = $questions->get($ans['questionId'] ?? '');
            $isCorrect = $q && strtolower(trim($ans['answer'] ?? '')) === strtolower(trim($q->answer ?? ''));
            return [
                'number' => $i + 1,
                'title' => $q?->title ?? 'Unknown',
                'yourAnswer' => $ans['answer'] ?? '(none)',
                'correctAnswer' => $q?->answer ?? 'N/A',
                'correct' => $isCorrect,
            ];
        });

        return response()->json([
            'student' => [
                'name' => $student?->name,
                'email' => $student?->email,
                'id' => $se->student_id,
            ],
            'exam' => [
                'title' => $exam?->title,
                'specialty' => $exam?->specialty,
                'subspecialty' => $exam?->subspecialty,
            ],
            'result' => [
                'score' => $se->score,
                'correct' => $se->correct,
                'total' => $se->total,
                'passingScore' => $se->passing_score,
                'passed' => $se->passed,
                'taken_at' => $se->taken_at,
            ],
            'breakdown' => $breakdown->values(),
        ]);
    }

    private function buildStats($studentId)
    {
        $studentExams = StudentExam::where('student_id', $studentId)->get();
        $exams = Exam::all()->keyBy('id');

        $attempts = $studentExams->map(function ($se) use ($exams) {
            $exam = $exams->get($se->exam_id);
            return [
                'id' => $se->id,
                'examId' => $se->exam_id,
                'examTitle' => $exam?->title ?? 'Unknown',
                'score' => $se->score,
                'taken_at' => $se->taken_at,
                'passed' => $se->passed,
                'correct' => $se->correct,
                'total' => $se->total,
                'passingScore' => $se->passing_score,
            ];
        })->sortBy('taken_at')->values();

        $scores = $attempts->pluck('score');
        $avg = $scores->count() ? (int) round($scores->avg()) : 0;
        $best = $scores->count() ? $scores->max() : 0;
        $last = $scores->count() ? $scores->last() : null;

        $improvement = 0;
        if ($scores->count() >= 2) {
            $half = (int) floor($scores->count() / 2);
            $firstAvg = (int) round($scores->take($half)->avg());
            $lastAvg = (int) round($scores->skip($half)->avg());
            $improvement = $lastAvg - $firstAvg;
        }

        $perExam = [];
        foreach ($attempts as $a) {
            $title = $a['examTitle'];
            if (!isset($perExam[$title])) $perExam[$title] = ['total' => 0, 'sum' => 0];
            $perExam[$title]['total']++;
            $perExam[$title]['sum'] += $a['score'];
        }
        $perExamStats = collect($perExam)->map(fn($v, $title) => [
            'title' => $title,
            'avg' => (int) round($v['sum'] / $v['total']),
            'attempts' => $v['total'],
        ])->values();

        return response()->json([
            'studentId' => $studentId,
            'attempts' => $attempts,
            'avgScore' => $avg,
            'bestScore' => $best,
            'lastScore' => $last,
            'improvement' => $improvement,
            'perExam' => $perExamStats,
        ]);
    }
}
