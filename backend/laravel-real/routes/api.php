<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\ModeratorController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\StudentExamController;
use App\Http\Controllers\SpecialtyController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function(){
    Route::get('me', [AuthController::class, 'me']);

    Route::middleware('role:admin')->group(function () {
        Route::get('admin/users', [AuthController::class, 'adminUsers']);
        Route::post('admin/users', [AuthController::class, 'adminCreateUser']);
        Route::put('admin/users/{id}', [AuthController::class, 'adminUpdateUser']);
        Route::delete('admin/users/{id}', [AuthController::class, 'adminDeleteUser']);

        Route::get('admin/specialties', [SpecialtyController::class, 'index']);
        Route::post('admin/specialties', [SpecialtyController::class, 'adminCreateSpecialty']);
        Route::post('admin/specialties/{parentId}/subspecialties', [SpecialtyController::class, 'adminCreateSubspecialty']);
        Route::delete('admin/specialties/{id}', [SpecialtyController::class, 'adminDeleteSpecialty']);
    });

    Route::get('questions', [QuestionController::class, 'index']);
    Route::get('my-questions', [QuestionController::class, 'myQuestions']);
    Route::post('questions', [QuestionController::class, 'store']);
    Route::get('questions/{id}', [QuestionController::class, 'show']);
    Route::put('questions/{id}', [QuestionController::class, 'update']);
    Route::delete('questions/{id}', [QuestionController::class, 'destroy']);

    Route::middleware('role:admin|moderator')->get('pending-questions', [ModeratorController::class, 'pending']);
    Route::middleware('role:admin|moderator')->post('questions/{id}/approve', [ModeratorController::class, 'approve']);
    Route::middleware('role:admin|moderator')->post('questions/{id}/reject', [ModeratorController::class, 'reject']);

    Route::post('exams', [ExamController::class, 'store']);
    Route::get('exams', [ExamController::class, 'index']);
    Route::get('exams/{id}', [ExamController::class, 'show']);
    Route::put('exams/{id}', [ExamController::class, 'update']);
    Route::delete('exams/{id}', [ExamController::class, 'destroy']);

    Route::get('specialties', [SpecialtyController::class, 'index']);

    Route::post('student-exams/{examId}/submit', [StudentExamController::class, 'submit']);
    Route::get('student-exams', [StudentExamController::class, 'index']);
    Route::get('all-student-exams', [StudentExamController::class, 'allStudentExams']);
    Route::get('exam-results/{examId}', [StudentExamController::class, 'examResults']);
    Route::get('my-stats', [StudentExamController::class, 'myStats']);
    Route::get('student-stats/{studentId}', [StudentExamController::class, 'studentStats']);
});
