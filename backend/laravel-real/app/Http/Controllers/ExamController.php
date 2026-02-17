<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exam;
use App\Models\Question;

class ExamController extends Controller
{
    public function index(){
        return response()->json(Exam::with(['specialty','subspecialty'])->get());
    }

    public function store(Request $request){
        $data = $request->validate(['title'=>'required','num_questions'=>'required|integer|min:1|max:200','difficulty_dist'=>'nullable|array','specialtyId'=>'nullable','subspecialtyId'=>'nullable']);
        // simple generator: pull approved questions, sample
        $qs = Question::where('status','approved')->inRandomOrder()->limit($data['num_questions'])->pluck('id')->toArray();
        $exam = Exam::create([
            'title'=>$data['title'],
            'created_by'=>$request->user()->id,
            'config'=>['difficulty_dist'=>$data['difficulty_dist'] ?? null],
            'specialty_id' => $data['specialtyId'] ?? null,
            'subspecialty_id' => $data['subspecialtyId'] ?? null
        ]);
        $exam->questions()->attach($qs);
        $exam->load(['specialty','subspecialty']);
        return response()->json($exam,201);
    }

    public function show($id){
        $exam = Exam::with(['questions','specialty','subspecialty'])->findOrFail($id);
        return response()->json($exam);
    }
}
