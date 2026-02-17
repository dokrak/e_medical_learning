<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\ModeratorController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\StudentExamController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function(){
    Route::get('me', [AuthController::class, 'me']);

    Route::get('questions', [QuestionController::class, 'index']);
    Route::post('questions', [QuestionController::class, 'store']);
    Route::get('questions/{id}', [QuestionController::class, 'show']);

    Route::middleware('role:admin|moderator')->get('pending-questions', [ModeratorController::class, 'pending']);
    Route::middleware('role:admin|moderator')->post('questions/{id}/approve', [ModeratorController::class, 'approve']);

    Route::post('exams', [ExamController::class, 'store']);
    Route::get('exams', [ExamController::class, 'index']);
    Route::get('exams/{id}', [ExamController::class, 'show']);

    Route::get('specialties', function(){ return \App\Models\Specialty::with('children')->whereNull('parent_id')->get(); });

    Route::post('student-exams/{examId}/submit', [StudentExamController::class, 'submit']);
    Route::get('student-exams', [StudentExamController::class, 'index']);
});
