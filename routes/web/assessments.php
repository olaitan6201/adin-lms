<?php

use App\Http\Controllers\Assessment\AssignmentController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');
    Route::post('/assignments/{assignment}', [AssignmentController::class, 'submit']);
    Route::get('/assignments/{assignment}/files/{file}', [AssignmentController::class, 'download']);
    Route::post('/submission-versions/{version}/marks', [AssignmentController::class, 'mark']);
});

use App\Http\Controllers\Assessment\ExamSessionController;

Route::middleware('auth')->group(function (): void {
    Route::post('/examinations/{exam}/start', [ExamSessionController::class, 'start']);
    Route::get('/attempts/{attempt}', [ExamSessionController::class, 'show'])->name('assessment.paper');
    Route::put('/attempts/{attempt}/answers/{question}', [ExamSessionController::class, 'save']);
    Route::post('/attempts/{attempt}/finish', [ExamSessionController::class, 'finish']);
});
