<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentExam extends Model
{
    protected $fillable = ['exam_id','student_id','answers','score'];
    protected $casts = ['answers' => 'array'];

    public function exam(){
        return $this->belongsTo(Exam::class);
    }

    public function student(){
        return $this->belongsTo(User::class, 'student_id');
    }
}
