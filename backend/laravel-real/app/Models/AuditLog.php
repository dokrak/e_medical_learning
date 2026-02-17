<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = ['entity','entity_id','action','user_id','details'];
    protected $casts = ['details' => 'array'];
}
