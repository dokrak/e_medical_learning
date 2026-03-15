<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Specialty;

class SpecialtyController extends Controller
{
    public function index()
    {
        return response()->json(Specialty::all());
    }
}
