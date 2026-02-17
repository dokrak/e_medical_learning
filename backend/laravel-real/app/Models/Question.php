<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $fillable = ['title','stem','body','difficulty','answer','references','choices','status','author_id'];
    protected $casts = ['references' => 'array', 'choices' => 'array'];

    public function images(){
        return $this->hasMany(QuestionImage::class);
    }

    public function author(){
        return $this->belongsTo(User::class, 'author_id');
    }

    public function patientMetadata(){
        return $this->hasOne(\App\Models\PatientMetadata::class);
    }
}
