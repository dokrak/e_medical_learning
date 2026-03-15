<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialty extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['id', 'name', 'subspecialties'];
    protected $casts = ['subspecialties' => 'array'];
}
