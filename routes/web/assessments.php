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

use App\Http\Controllers\Assessment\AssessmentDeskController;
use App\Http\Controllers\Assessment\AssessmentSetupController;
use App\Http\Controllers\Assessment\ExamAuthorController;
use App\Http\Controllers\Assessment\GradebookController;

Route::middleware('auth')->group(function (): void {
    Route::get('/courses/{offering}/assessments', AssessmentDeskController::class)->name('assessment.desk');
    Route::post('/courses/{offering}/assessments', [AssessmentSetupController::class, 'book']);
    Route::post('/assessment-items/{item}/assignment', [AssessmentSetupController::class, 'assignment']);
    Route::post('/assessment-items/{item}/exam', [ExamAuthorController::class, 'create']);
    Route::post('/examinations/{exam}/accommodations', [ExamAuthorController::class, 'accommodate']);
    Route::get('/attempts/{attempt}/review', [ExamAuthorController::class, 'script']);
    Route::post('/attempts/{attempt}/review', [ExamAuthorController::class, 'mark']);
    Route::post('/assessment-items/{item}/score', [GradebookController::class, 'score']);
    Route::post('/gradebooks/{book}/compute/{enrolment}', [GradebookController::class, 'compute']);
    Route::post('/grades/{grade}/review', [GradebookController::class, 'review']);
    Route::get('/grades/{grade}/sheet', [GradebookController::class, 'sheet'])->name('assessment.sheet');
});
