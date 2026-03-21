<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Exam;
use App\Models\Question;
use App\Models\Specialty;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    /**
     * POST /api/exams — create exam with question selection
     */
    public function store(Request $request)
    {
        $numQuestions = (int) ($request->input('numQuestions', $request->input('num_questions', 10)));
        $selectionMode = $request->input('selectionMode', 'random');
        $passingScore = $request->has('passingScore') ? (int) $request->input('passingScore') : 50;
        $specialtyId = $request->input('specialtyId');
        $subspecialtyId = $request->input('subspecialtyId');
        $difficultyLevel = $request->input('difficultyLevel');
        $difficultyDistribution = $request->input('difficultyDistribution');
        $selectedQuestionIds = $request->input('selectedQuestionIds', []);

        $allQs = Question::where('status', 'approved')->get();

        // Filter pool
        $pool = $allQs->filter(function ($q) use ($specialtyId, $subspecialtyId, $difficultyLevel, $difficultyDistribution) {
            if ($specialtyId && $q->specialty_id !== $specialtyId) return false;
            if ($subspecialtyId && $q->subspecialty_id !== $subspecialtyId) return false;
            if (!$difficultyDistribution && $difficultyLevel && !$this->matchesDifficulty($q, $difficultyLevel)) return false;
            return true;
        })->values();

        $selected = collect();

        if ($selectionMode === 'manual' && is_array($selectedQuestionIds) && count($selectedQuestionIds) > 0) {
            $poolIds = $pool->pluck('id')->toArray();
            $valid = collect($selectedQuestionIds)->filter(fn($id) => in_array($id, $poolIds));
            $selected = $valid->take($numQuestions);
        } elseif ($difficultyDistribution && is_array($difficultyDistribution)) {
            $selected = $this->selectByDistribution($pool, $difficultyDistribution, $numQuestions);
        } else {
            $selected = $pool->shuffle()->take($numQuestions)->pluck('id');
        }

        $selected = $selected->unique()->take($numQuestions)->values();
        $selectedQuestions = $allQs->whereIn('id', $selected);

        $totalDifficultyScore = $selectedQuestions->sum(fn($q) => is_numeric($q->difficulty) ? (int) $q->difficulty : 3);
        $averageDifficultyScore = $selectedQuestions->count()
            ? round($totalDifficultyScore / $selectedQuestions->count(), 2)
            : 0;

        $computedDifficultyLevel = 'medium';
        if ($averageDifficultyScore <= 2) $computedDifficultyLevel = 'easy';
        elseif ($averageDifficultyScore <= 3) $computedDifficultyLevel = 'medium';
        elseif ($averageDifficultyScore <= 4) $computedDifficultyLevel = 'difficult';
        else $computedDifficultyLevel = 'extreme';

        $spec = $specialtyId ? Specialty::find($specialtyId) : null;
        $subspec = null;
        if ($spec && is_array($spec->subspecialties)) {
            $subspec = collect($spec->subspecialties)->firstWhere('id', $subspecialtyId);
        }

        $exam = Exam::create([
            'title' => $request->input('title', 'Exam'),
            'created_by' => $request->user()->id,
            'questions' => $selected->values()->toArray(),
            'specialty' => $spec ? ['id' => $spec->id, 'name' => $spec->name] : null,
            'subspecialty' => $subspec ? ['id' => $subspec['id'], 'name' => $subspec['name']] : null,
            'difficulty_level' => $difficultyLevel,
            'difficulty_distribution' => $difficultyDistribution,
            'selection_mode' => $selectionMode,
            'passing_score' => $passingScore,
            'total_difficulty_score' => $totalDifficultyScore,
            'average_difficulty_score' => $averageDifficultyScore,
            'computed_difficulty_level' => $computedDifficultyLevel,
        ]);

        return response()->json($this->formatExam($exam));
    }

    /**
     * GET /api/exams
     */
    public function index()
    {
        return response()->json(Exam::all()->map(fn($e) => $this->formatExam($e))->values());
    }

    /**
     * GET /api/exams/{id} — with embedded question objects
     */
    public function show(string $id)
    {
        $exam = Exam::findOrFail($id);
        $questions = Question::whereIn('id', $exam->questions ?? [])->get();
        $data = $this->formatExam($exam);
        $data['questions'] = $questions->map(fn($q) => [
            'id' => $q->id,
            'title' => $q->title,
            'stem' => $q->stem,
            'body' => $q->body,
            'difficulty' => $q->difficulty,
            'choices' => $q->choices ?? [],
            'references' => $q->references ?? [],
            'images' => $q->images ?? [],
            'specialtyId' => $q->specialty_id,
            'subspecialtyId' => $q->subspecialty_id,
            'status' => $q->status,
            'authorId' => $q->author_id,
        ])->values();

        return response()->json($data);
    }

    /**
     * PUT /api/exams/{id}
     */
    public function update(string $id, Request $request)
    {
        $exam = Exam::findOrFail($id);
        $user = $request->user();

        if ($exam->created_by !== $user->id && $user->role !== 'admin') {
            return response()->json(['error' => 'can only edit your own exams'], 403);
        }

        if ($request->has('title')) $exam->title = $request->title;
        if ($request->has('difficultyLevel')) $exam->difficulty_level = $request->difficultyLevel ?: null;
        if ($request->has('selectionMode')) $exam->selection_mode = $request->selectionMode ?: 'random';
        if ($request->has('difficultyDistribution')) $exam->difficulty_distribution = $request->difficultyDistribution ?: null;
        if ($request->has('passingScore')) $exam->passing_score = (int) $request->passingScore;

        $allQs = Question::where('status', 'approved')->get();
        $selectionMode = $request->input('selectionMode', $exam->selection_mode);
        $selectedQuestionIds = $request->input('selectedQuestionIds', []);
        $difficultyLevel = $request->input('difficultyLevel', $exam->difficulty_level);
        $difficultyDistribution = $request->input('difficultyDistribution', $exam->difficulty_distribution);
        $specialtyId = $request->input('specialtyId', $exam->specialty['id'] ?? null);
        $subspecialtyId = $request->input('subspecialtyId', $exam->subspecialty['id'] ?? null);
        $numQuestions = $request->input('numQuestions', count($exam->questions ?? []));

        if ($selectionMode === 'manual' && is_array($selectedQuestionIds) && count($selectedQuestionIds) > 0) {
            $exam->questions = collect($selectedQuestionIds)
                ->filter(fn($qid) => $allQs->contains('id', $qid))
                ->values()->toArray();
        } elseif ($request->has('numQuestions') || $request->has('specialtyId') || $request->has('subspecialtyId') || $request->has('difficultyLevel') || $request->has('difficultyDistribution')) {
            $pool = $allQs->filter(function ($q) use ($specialtyId, $subspecialtyId, $difficultyLevel, $difficultyDistribution) {
                if ($specialtyId && $q->specialty_id !== $specialtyId) return false;
                if ($subspecialtyId && $q->subspecialty_id !== $subspecialtyId) return false;
                if (!$difficultyDistribution && $difficultyLevel && !$this->matchesDifficulty($q, $difficultyLevel)) return false;
                return true;
            })->values();

            if ($difficultyDistribution && is_array($difficultyDistribution)) {
                $exam->questions = $this->selectByDistribution($pool, $difficultyDistribution, $numQuestions)->toArray();
            } else {
                $exam->questions = $pool->shuffle()->take($numQuestions)->pluck('id')->values()->toArray();
            }

            $spec = $specialtyId ? Specialty::find($specialtyId) : null;
            $subspec = null;
            if ($spec && is_array($spec->subspecialties)) {
                $subspec = collect($spec->subspecialties)->firstWhere('id', $subspecialtyId);
            }
            $exam->specialty = $spec ? ['id' => $spec->id, 'name' => $spec->name] : $exam->specialty;
            $exam->subspecialty = $subspec ? ['id' => $subspec['id'], 'name' => $subspec['name']] : $exam->subspecialty;
        }

        $exam->save();

        AuditLog::create([
            'entity' => 'exam',
            'entity_id' => $id,
            'action' => 'edit',
            'user_id' => $user->id,
        ]);

        return response()->json($this->formatExam($exam));
    }

    /**
     * DELETE /api/exams/{id}
     */
    public function destroy(string $id, Request $request)
    {
        $exam = Exam::findOrFail($id);
        $user = $request->user();

        if ($exam->created_by !== $user->id && $user->role !== 'admin') {
            return response()->json(['error' => 'can only delete your own exams'], 403);
        }

        $exam->delete();

        AuditLog::create([
            'entity' => 'exam',
            'entity_id' => $id,
            'action' => 'delete',
            'user_id' => $user->id,
        ]);

        return response()->json(['success' => true]);
    }

    private function matchesDifficulty($q, $level): bool
    {
        if (!$level) return true;
        $d = (int) ($q->difficulty ?? 3);
        return match ($level) {
            'easy' => $d <= 2,
            'medium' => $d === 3,
            'difficult' => $d === 4,
            'extreme' => $d >= 5,
            default => true,
        };
    }

    private function selectByDistribution($pool, array $dist, int $numQuestions)
    {
        $buckets = collect($dist)->map(function ($pct, $key) {
            return ['key' => $key, 'pct' => (int) $pct, 'levels' => $this->expandKeyToLevels($key)];
        })->values();

        $totalPct = $buckets->sum('pct') ?: 100;
        if ($totalPct !== 100) {
            $buckets = $buckets->map(function ($b) use ($totalPct) {
                $b['pct'] = round(($b['pct'] / $totalPct) * 100);
                return $b;
            });
        }

        $allocations = $buckets->map(function ($b) use ($numQuestions) {
            return ['levels' => $b['levels'], 'target' => (int) round($numQuestions * ($b['pct'] / 100)), 'taken' => []];
        });

        $allocatedSum = $allocations->sum('target');
        $diff = $numQuestions - $allocatedSum;
        if ($diff !== 0) {
            $allocations = $allocations->sortByDesc(fn($a) => count($a['levels']))->values();
            for ($i = 0; $diff !== 0 && $i < $allocations->count(); $i++) {
                $a = $allocations[$i];
                $a['target'] += $diff > 0 ? 1 : -1;
                $allocations[$i] = $a;
                $diff += $diff > 0 ? -1 : 1;
            }
        }

        $poolByLevel = [];
        foreach ($pool as $q) {
            $poolByLevel[$q->difficulty][] = $q;
        }

        $selected = collect();
        foreach ($allocations as $a) {
            $candidates = collect();
            foreach ($a['levels'] as $l) {
                if (isset($poolByLevel[$l])) {
                    $candidates = $candidates->merge($poolByLevel[$l]);
                }
            }
            $taken = $candidates->shuffle()->take(max(0, $a['target']))->pluck('id');
            $selected = $selected->merge($taken);
        }

        if ($selected->count() < $numQuestions) {
            $remaining = $pool->whereNotIn('id', $selected->toArray())->shuffle()->take($numQuestions - $selected->count())->pluck('id');
            $selected = $selected->merge($remaining);
        }

        return $selected->unique()->take($numQuestions)->values();
    }

    private function expandKeyToLevels(string $key): array
    {
        if (preg_match('/^(\d+)-(\d+)$/', $key, $m)) {
            return range((int) $m[1], (int) $m[2]);
        }
        if (is_numeric($key)) return [(int) $key];
        return [];
    }

    private function formatExam(Exam $e): array
    {
        return [
            'id' => $e->id,
            'title' => $e->title,
            'createdBy' => $e->created_by,
            'questions' => $e->questions ?? [],
            'specialty' => $e->specialty,
            'subspecialty' => $e->subspecialty,
            'difficultyLevel' => $e->difficulty_level,
            'difficultyDistribution' => $e->difficulty_distribution,
            'selectionMode' => $e->selection_mode,
            'passingScore' => $e->passing_score,
            'totalDifficultyScore' => $e->total_difficulty_score,
            'averageDifficultyScore' => $e->average_difficulty_score,
            'computedDifficultyLevel' => $e->computed_difficulty_level,
            'created_at' => $e->created_at?->toISOString(),
        ];
    }
}
