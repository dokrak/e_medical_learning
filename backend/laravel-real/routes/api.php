<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Api\SpecialtyController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\StudentExamController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\UploadController;

// --- Public routes ---
Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::get('/specialties', [SpecialtyController::class, 'index']);

// --- Platform stats (public, counts only) ---
Route::get('/platform-stats', function () {
    $users = \App\Models\User::select('name', 'role', 'hospital', 'province', 'profile_picture')->get();

    // Group by hospital
    $hospitals = $users->filter(fn($u) => $u->hospital)
        ->groupBy('hospital')
        ->map(fn($group) => [
            'hospital' => $group->first()->hospital,
            'province' => $group->first()->province,
            'count' => $group->count(),
            'roles' => $group->pluck('role')->unique()->values(),
        ])->values();

    // Team members (staff roles only: clinician, moderator, admin, fellow)
    $team = $users->filter(fn($u) => in_array($u->role, ['clinician', 'moderator', 'admin', 'fellow']))
        ->map(fn($u) => [
            'name' => $u->name,
            'role' => $u->role,
            'hospital' => $u->hospital,
            'province' => $u->province,
            'profile_picture' => $u->profile_picture,
        ])->values();

    // Role counts
    $roleCounts = $users->groupBy('role')->map->count();

    // Role to hospitals mapping
    $roleHospitals = $users->filter(fn($u) => $u->hospital)
        ->groupBy('role')
        ->map(fn($group) => $group->groupBy('hospital')->map(fn($g) => [
            'hospital' => $g->first()->hospital,
            'province' => $g->first()->province,
            'count' => $g->count(),
        ])->values())->toArray();

    return response()->json([
        'questions' => \App\Models\Question::where('status', 'approved')->count(),
        'exams'     => \App\Models\Exam::count(),
        'users'     => $users->count(),
        'specialties' => \App\Models\Specialty::count(),
        'hospitals' => $hospitals,
        'team' => $team,
        'roleCounts' => $roleCounts,
        'roleHospitals' => $roleHospitals,
    ]);
});

// --- Approved questions (public, read-only) ---
Route::get('/questions', [QuestionController::class, 'index']);

// --- Authenticated routes ---
Route::middleware('auth:sanctum')->group(function () {

    // Current user
    Route::get('/user', fn(Request $request) => $request->user());
    Route::get('/me', fn(Request $request) => response()->json(['user' => $request->user()]));

    // --- Questions ---
    Route::post('/questions', [QuestionController::class, 'store']);
    Route::get('/my-questions', [QuestionController::class, 'mine']);
    Route::put('/questions/{id}', [QuestionController::class, 'update']);
    Route::delete('/questions/{id}', [QuestionController::class, 'destroy']);

    // Moderation (admin / moderator)
    Route::get('/pending-questions', [QuestionController::class, 'pending']);
    Route::post('/questions/{id}/approve', [QuestionController::class, 'approve']);
    Route::post('/questions/{id}/reject', [QuestionController::class, 'reject']);

    // --- Exams ---
    Route::get('/exams', [ExamController::class, 'index']);
    Route::get('/exams/{id}', [ExamController::class, 'show']);
    Route::post('/exams', [ExamController::class, 'store']);
    Route::put('/exams/{id}', [ExamController::class, 'update']);
    Route::delete('/exams/{id}', [ExamController::class, 'destroy']);

    // --- Student Exams ---
    Route::post('/student-exams/{examId}/submit', [StudentExamController::class, 'submit']);
    Route::get('/student-exams', [StudentExamController::class, 'index']);
    Route::get('/all-student-exams', [StudentExamController::class, 'all']);
    Route::get('/exam-results/{examId}', [StudentExamController::class, 'examResults']);
    Route::get('/my-stats', [StudentExamController::class, 'myStats']);
    Route::get('/student-stats/{studentId}', [StudentExamController::class, 'studentStats']);
    Route::get('/student-exams/{resultId}/pdf', [StudentExamController::class, 'pdf']);

    // --- File Upload ---
    Route::post('/upload', [UploadController::class, 'store']);

    // --- Admin User Management ---
    Route::get('/admin/users', [AdminUserController::class, 'index']);
    Route::post('/admin/users', [AdminUserController::class, 'store']);
    Route::put('/admin/users/{id}', [AdminUserController::class, 'update']);
    Route::delete('/admin/users/{id}', [AdminUserController::class, 'destroy']);
    // --- Specialties Management (admin only) ---
    Route::get('/admin/specialties', [SpecialtyController::class, 'index']);
    Route::post('/admin/specialties', [SpecialtyController::class, 'store']);
    Route::put('/admin/specialties/{id}', [SpecialtyController::class, 'update']);
    Route::delete('/admin/specialties/{id}', [SpecialtyController::class, 'destroy']);
});
