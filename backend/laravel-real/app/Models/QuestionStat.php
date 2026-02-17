<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionStat extends Model
{
    protected $fillable = ['question_id','attempts','corrects','difficulty_estimate'];
}
