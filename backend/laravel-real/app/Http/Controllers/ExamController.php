<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exam;
use App\Models\Question;

class ExamController extends Controller
{
    public function index(){
        $exams = Exam::with(['specialty','subspecialty'])
            ->withCount('questions')
            ->get();
        $exams->each(function ($exam) {
            $exam->backfillDifficultyMetrics();
        });
        return response()->json($exams);
    }

    public function store(Request $request){
        $data = $request->validate([
            'title' => 'required|string',
            'num_questions' => 'nullable|integer|min:1|max:200',
            'numQuestions' => 'nullable|integer|min:1|max:200',
            'difficulty_dist' => 'nullable|array',
            'difficultyDistribution' => 'nullable|array',
            'difficultyLevel' => 'nullable|string',
            'specialtyId' => 'nullable',
            'subspecialtyId' => 'nullable'
        ]);

        $numQuestions = (int) ($data['numQuestions'] ?? $data['num_questions'] ?? 10);
        $numQuestions = max(1, min(200, $numQuestions));

        // simple generator: pull approved questions, sample
        $selectedQuestionIds = Question::where('status', 'approved')
            ->inRandomOrder()
            ->limit($numQuestions)
            ->pluck('id')
            ->toArray();

        $selectedQuestions = Question::whereIn('id', $selectedQuestionIds)->get(['id', 'difficulty']);
        $totalDifficultyScore = (int) $selectedQuestions->sum(function ($question) {
            $score = (int) $question->difficulty;
            return $score > 0 ? $score : 3;
        });
        $questionCount = $selectedQuestions->count();
        $averageDifficultyScore = $questionCount > 0
            ? round($totalDifficultyScore / $questionCount, 2)
            : 0;

        $computedDifficultyLevel = 'medium';
        if ($averageDifficultyScore <= 2) {
            $computedDifficultyLevel = 'easy';
        } elseif ($averageDifficultyScore <= 3) {
            $computedDifficultyLevel = 'medium';
        } elseif ($averageDifficultyScore <= 4) {
            $computedDifficultyLevel = 'difficult';
        } else {
            $computedDifficultyLevel = 'extreme';
        }

        $exam = Exam::create([
            'title' => $data['title'],
            'created_by' => $request->user()->id,
            'config' => [
                'difficulty_dist' => $data['difficulty_dist'] ?? $data['difficultyDistribution'] ?? null,
                'difficultyLevel' => $data['difficultyLevel'] ?? null,
                'totalDifficultyScore' => $totalDifficultyScore,
                'averageDifficultyScore' => $averageDifficultyScore,
                'computedDifficultyLevel' => $computedDifficultyLevel,
            ],
            'specialty_id' => $data['specialtyId'] ?? null,
            'subspecialty_id' => $data['subspecialtyId'] ?? null
        ]);
        $exam->questions()->attach($selectedQuestionIds);
        $exam->load(['specialty','subspecialty']);
        return response()->json($exam,201);
    }

    public function show($id){
        $exam = Exam::with(['questions','specialty','subspecialty'])->findOrFail($id);
        $exam->backfillDifficultyMetrics();
        return response()->json($exam);
    }

    public function update(Request $request, int $id)
    {
        $exam = Exam::with('questions')->findOrFail($id);

        $data = $request->validate([
            'title' => 'required|string',
            'num_questions' => 'nullable|integer|min:1|max:200',
            'numQuestions' => 'nullable|integer|min:1|max:200',
            'difficulty_dist' => 'nullable|array',
            'difficultyDistribution' => 'nullable|array',
            'difficultyLevel' => 'nullable|string',
            'selectionMode' => 'nullable|string|in:random,manual',
            'selectedQuestionIds' => 'nullable|array',
            'specialtyId' => 'nullable',
            'subspecialtyId' => 'nullable',
        ]);

        $exam->title = $data['title'];
        $exam->specialty_id = $data['specialtyId'] ?? null;
        $exam->subspecialty_id = $data['subspecialtyId'] ?? null;

        $numQuestions = (int) ($data['numQuestions'] ?? $data['num_questions'] ?? max(1, $exam->questions->count()));
        $numQuestions = max(1, min(200, $numQuestions));

        $selectionMode = $data['selectionMode'] ?? 'random';
        if ($selectionMode === 'manual' && !empty($data['selectedQuestionIds'])) {
            $selectedQuestionIds = Question::whereIn('id', $data['selectedQuestionIds'])->pluck('id')->toArray();
        } else {
            $selectedQuestionIds = Question::where('status', 'approved')
                ->inRandomOrder()
                ->limit($numQuestions)
                ->pluck('id')
                ->toArray();
        }

        $selectedQuestions = Question::whereIn('id', $selectedQuestionIds)->get(['id', 'difficulty']);
        $totalDifficultyScore = (int) $selectedQuestions->sum(function ($question) {
            $score = (int) $question->difficulty;
            return $score > 0 ? $score : 3;
        });
        $questionCount = $selectedQuestions->count();
        $averageDifficultyScore = $questionCount > 0 ? round($totalDifficultyScore / $questionCount, 2) : 0;

        $computedDifficultyLevel = 'medium';
        if ($averageDifficultyScore <= 2) {
            $computedDifficultyLevel = 'easy';
        } elseif ($averageDifficultyScore <= 3) {
            $computedDifficultyLevel = 'medium';
        } elseif ($averageDifficultyScore <= 4) {
            $computedDifficultyLevel = 'difficult';
        } else {
            $computedDifficultyLevel = 'extreme';
        }

        $exam->config = [
            'difficulty_dist' => $data['difficulty_dist'] ?? $data['difficultyDistribution'] ?? null,
            'difficultyLevel' => $data['difficultyLevel'] ?? null,
            'totalDifficultyScore' => $totalDifficultyScore,
            'averageDifficultyScore' => $averageDifficultyScore,
            'computedDifficultyLevel' => $computedDifficultyLevel,
            'selectionMode' => $selectionMode,
        ];

        $exam->save();
        $exam->questions()->sync($selectedQuestionIds);
        $exam->load(['questions','specialty','subspecialty']);

        return response()->json($exam);
    }

    public function destroy(int $id)
    {
        $exam = Exam::findOrFail($id);
        $exam->delete();
        return response()->json(['ok' => true]);
    }
}
