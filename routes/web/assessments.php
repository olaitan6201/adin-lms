<?php

use App\Http\Controllers\Assessment\AssessmentDeskController;
use App\Http\Controllers\Assessment\AssessmentSetupController;
use App\Http\Controllers\Assessment\AssignmentController;
use App\Http\Controllers\Assessment\ExamAuthorController;
use App\Http\Controllers\Assessment\ExamSessionController;
use App\Http\Controllers\Assessment\GradebookController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::prefix('courses/{offering}/assessments')->group(function (): void {
        Route::get('/', AssessmentDeskController::class)->name('assessment.desk');
        Route::post('/', [AssessmentSetupController::class, 'book'])->name('assessment.setup');
    });

    Route::prefix('assessment-items/{item}')->group(function (): void {
        Route::post('assignment', [AssessmentSetupController::class, 'assignment'])->name('assessment.items.assignment');
        Route::post('exam', [ExamAuthorController::class, 'create'])->name('assessment.items.exam');
        Route::post('score', [GradebookController::class, 'score'])->name('assessment.items.score');
    });

    Route::prefix('assignments/{assignment}')->controller(AssignmentController::class)->group(function (): void {
        Route::get('/', 'show')->name('assignments.show');
        Route::post('/', 'submit')->name('assignments.submit');
        Route::get('files/{file}', 'download')->name('assignments.files.download');
    });

    Route::post('submission-versions/{version}/marks', [AssignmentController::class, 'mark'])
        ->name('assignments.versions.mark');

    Route::prefix('examinations/{exam}')->group(function (): void {
        Route::post('accommodations', [ExamAuthorController::class, 'accommodate'])->name('assessment.accommodations');
        Route::post('start', [ExamSessionController::class, 'start'])->name('assessment.attempts.start');
    });

    Route::prefix('attempts/{attempt}')->group(function (): void {
        Route::get('/', [ExamSessionController::class, 'show'])->name('assessment.paper');
        Route::put('answers/{question}', [ExamSessionController::class, 'save'])->name('assessment.answers.save');
        Route::post('finish', [ExamSessionController::class, 'finish'])->name('assessment.attempts.finish');
        Route::get('review', [ExamAuthorController::class, 'script'])->name('assessment.review.show');
        Route::post('review', [ExamAuthorController::class, 'mark'])->name('assessment.review.mark');
    });

    Route::controller(GradebookController::class)->group(function (): void {
        Route::post('gradebooks/{book}/compute/{enrolment}', 'compute')->name('assessment.grades.compute');
        Route::post('grades/{grade}/review', 'review')->name('assessment.grades.review');
        Route::get('grades/{grade}/sheet', 'sheet')->name('assessment.sheet');
    });
});
