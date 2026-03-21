<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Question extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'title', 'stem', 'body', 'answer_explanation', 'difficulty',
        'answer', 'choices', 'references', 'images',
        'specialty_id', 'subspecialty_id', 'status', 'moderation_feedback', 'author_id',
    ];

    protected $casts = [
        'choices' => 'array',
        'references' => 'array',
        'images' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (!$model->id) $model->id = (string) Str::uuid();
        });
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
