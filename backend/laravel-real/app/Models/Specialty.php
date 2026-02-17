<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialty extends Model
{
    protected $fillable = ['name','parent_id'];

    public function children(){
        return $this->hasMany(Specialty::class, 'parent_id');
    }

    public function parent(){
        return $this->belongsTo(Specialty::class, 'parent_id');
    }
}
