<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientMetadata extends Model
{
    protected $fillable = ['question_id','consent_obtained','deidentified','notes'];
    protected $casts = ['consent_obtained' => 'boolean', 'deidentified' => 'boolean'];

    public function question(){
        return $this->belongsTo(Question::class);
    }
}
