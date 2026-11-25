<?php

use App\Http\Controllers\Assessment\AssessmentDeskController;
use App\Http\Controllers\Assessment\AssessmentSetupController;
use App\Http\Controllers\Assessment\AssignmentController;
use App\Http\Controllers\Assessment\AssignmentInstructionsController;
use App\Http\Controllers\Assessment\ExamAuthorController;
use App\Http\Controllers\Assessment\ExamSessionController;
use App\Http\Controllers\Assessment\GradebookController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::prefix('courses/{offering}/assessments')->group(function (): void {
        Route::get('/', AssessmentDeskController::class)->name('assessment.desk');
        Route::post('/', [AssessmentSetupController::class, 'book'])->name('assessment.activate');
    });

    Route::prefix('assessment-items/{item}')->group(function (): void {
        Route::post('assignment', [AssessmentSetupController::class, 'assignment'])->name('assessment.assignment.create');
        Route::post('exam', [ExamAuthorController::class, 'create'])->name('assessment.exam.create');
        Route::post('score', [GradebookController::class, 'score'])->name('assessment.score.record');
    });

    Route::prefix('assignments/{assignment}')->controller(AssignmentController::class)->group(function (): void {
        Route::get('/', 'show')->name('assignments.show');
        Route::get('instructions', AssignmentInstructionsController::class)->name('assignments.instructions');
        Route::post('/', 'submit')->name('assignments.submit');
        Route::get('files/{file}', 'download')->name('assignments.download');
    });

    Route::post('submission-versions/{version}/marks', [AssignmentController::class, 'mark'])->name('assignments.mark');

    Route::prefix('examinations/{exam}')->group(function (): void {
        Route::post('start', [ExamSessionController::class, 'start'])->name('assessment.start');
        Route::post('accommodations', [ExamAuthorController::class, 'accommodate'])->name('assessment.accommodate');
    });

    Route::prefix('attempts/{attempt}')->group(function (): void {
        Route::get('/', [ExamSessionController::class, 'show'])->name('assessment.paper');
        Route::put('answers/{question}', [ExamSessionController::class, 'save'])->name('assessment.save');
        Route::post('finish', [ExamSessionController::class, 'finish'])->name('assessment.finish');
        Route::get('review', [ExamAuthorController::class, 'script'])->name('assessment.script');
        Route::post('review', [ExamAuthorController::class, 'mark'])->name('assessment.mark');
    });

    Route::controller(GradebookController::class)->group(function (): void {
        Route::post('gradebooks/{book}/compute/{enrolment}', 'compute')->name('assessment.compute');
        Route::post('grades/{grade}/review', 'review')->name('assessment.moderate');
        Route::get('grades/{grade}/sheet', 'sheet')->name('assessment.sheet');
    });
});
