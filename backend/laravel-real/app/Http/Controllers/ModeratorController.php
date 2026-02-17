<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Question;
use App\Models\AuditLog;

class ModeratorController extends Controller
{
    public function pending(){
        return response()->json(Question::where('status','pending')->get());
    }

    public function approve(Request $request, $id){
        $q = Question::findOrFail($id);
        $q->status = 'approved';
        $q->save();
        AuditLog::create(['entity'=>'question','entity_id'=>$q->id,'action'=>'approve','user_id'=>$request->user()->id]);
        return response()->json($q);
    }
}
