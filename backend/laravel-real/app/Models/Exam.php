<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $fillable = ['title','created_by','config','specialty_id','subspecialty_id'];
    protected $casts = ['config' => 'array'];
    protected $appends = ['totalDifficultyScore', 'averageDifficultyScore', 'computedDifficultyLevel'];

    public function getTotalDifficultyScoreAttribute(){
        return (int) data_get($this->config, 'totalDifficultyScore', 0);
    }

    public function getAverageDifficultyScoreAttribute(){
        return (float) data_get($this->config, 'averageDifficultyScore', 0);
    }

    public function getComputedDifficultyLevelAttribute(){
        return data_get($this->config, 'computedDifficultyLevel');
    }

    public function needsDifficultyBackfill(){
        return data_get($this->config, 'totalDifficultyScore') === null
            || data_get($this->config, 'averageDifficultyScore') === null
            || data_get($this->config, 'computedDifficultyLevel') === null;
    }

    public function calculateDifficultyMetrics(){
        $difficulties = $this->questions()->pluck('difficulty')->map(function ($value) {
            $score = (int) $value;
            return $score > 0 ? $score : 3;
        });

        $totalDifficultyScore = (int) $difficulties->sum();
        $questionCount = $difficulties->count();
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

        return [
            'totalDifficultyScore' => $totalDifficultyScore,
            'averageDifficultyScore' => $averageDifficultyScore,
            'computedDifficultyLevel' => $computedDifficultyLevel,
        ];
    }

    public function backfillDifficultyMetrics(){
        if (!$this->needsDifficultyBackfill()) {
            return [
                'totalDifficultyScore' => (int) data_get($this->config, 'totalDifficultyScore', 0),
                'averageDifficultyScore' => (float) data_get($this->config, 'averageDifficultyScore', 0),
                'computedDifficultyLevel' => data_get($this->config, 'computedDifficultyLevel'),
            ];
        }

        $metrics = $this->calculateDifficultyMetrics();
        $config = is_array($this->config) ? $this->config : [];
        $this->config = array_merge($config, $metrics);
        $this->save();

        return $metrics;
    }

    public function questions(){
        return $this->belongsToMany(Question::class, 'exam_questions');
    }

    public function specialty(){
        return $this->belongsTo(\App\Models\Specialty::class, 'specialty_id');
    }

    public function subspecialty(){
        return $this->belongsTo(\App\Models\Specialty::class, 'subspecialty_id');
    }
}
