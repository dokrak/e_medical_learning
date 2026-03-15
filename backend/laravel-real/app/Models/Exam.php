<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Exam extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'title', 'created_by', 'questions', 'specialty', 'subspecialty',
        'difficulty_level', 'difficulty_distribution', 'selection_mode',
        'passing_score', 'total_difficulty_score', 'average_difficulty_score',
        'computed_difficulty_level',
    ];

    protected $casts = [
        'questions' => 'array',
        'specialty' => 'array',
        'subspecialty' => 'array',
        'difficulty_distribution' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (!$model->id) $model->id = (string) Str::uuid();
        });
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
