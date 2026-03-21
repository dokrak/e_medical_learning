<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class StudentExam extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'student_exams';

    protected $fillable = [
        'id', 'exam_id', 'student_id', 'answers', 'score', 'passed',
        'total', 'correct', 'passing_score', 'taken_at',
    ];

    protected $casts = [
        'answers' => 'array',
        'passed' => 'boolean',
        'taken_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (!$model->id) $model->id = (string) Str::uuid();
        });
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
