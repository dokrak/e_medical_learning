<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $fillable = ['title','created_by','config','specialty_id','subspecialty_id'];
    protected $casts = ['config' => 'array'];

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
