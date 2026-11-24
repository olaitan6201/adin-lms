<?php

use App\Http\Controllers\Assessment\AssignmentController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');
    Route::post('/assignments/{assignment}', [AssignmentController::class, 'submit']);
    Route::get('/assignments/{assignment}/files/{file}', [AssignmentController::class, 'download']);
    Route::post('/submission-versions/{version}/marks', [AssignmentController::class, 'mark']);
});
