<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exam;
use App\Models\StudentExam;
use App\Models\Question;
use App\Models\QuestionStat;

class StudentExamController extends Controller
{
    public function index(Request $request){
        return response()->json(StudentExam::where('student_id',$request->user()->id)->get());
    }

    public function submit(Request $request, $examId){
        $data = $request->validate(['answers'=>'required|array']);
        $exam = Exam::with('questions')->findOrFail($examId);
        $questions = $exam->questions;
        $correct = 0;
        foreach($data['answers'] as $ans){
            $q = $questions->firstWhere('id', $ans['questionId']);
            if (!$q) continue;
            if (trim(strtolower($ans['answer'])) === trim(strtolower($q->answer))) $correct++;

            // update simple stats
            $stat = QuestionStat::firstOrCreate(['question_id'=>$q->id], ['attempts'=>0,'corrects'=>0]);
            $stat->attempts++;
            if (trim(strtolower($ans['answer'])) === trim(strtolower($q->answer))) $stat->corrects++;
            $stat->difficulty_estimate = ($stat->attempts>0) ? (1 - ($stat->corrects / $stat->attempts)) * 5 : $stat->difficulty_estimate;
            $stat->save();
        }
        $score = round(($correct / $questions->count()) * 100, 2);
        $se = StudentExam::create(['exam_id'=>$exam->id,'student_id'=>$request->user()->id,'answers'=>$data['answers'],'score'=>$score]);
        return response()->json(['score'=>$score,'total'=>$questions->count(),'correct'=>$correct]);
    }
}
