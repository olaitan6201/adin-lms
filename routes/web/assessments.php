<?php

use App\Http\Controllers\Assessment\AssessmentDeskController;
use App\Http\Controllers\Assessment\AssessmentSetupController;
use App\Http\Controllers\Assessment\AssignmentController;
use App\Http\Controllers\Assessment\AssignmentInstructionsController;
use App\Http\Controllers\Assessment\ExamAuthorController;
use App\Http\Controllers\Assessment\ExaminationsOfficeController;
use App\Http\Controllers\Assessment\ExamIntegrityController;
use App\Http\Controllers\Assessment\ExamSessionController;
use App\Http\Controllers\Assessment\GradebookController;
use App\Http\Controllers\Assessment\ModerationEvidenceController;
use App\Http\Controllers\Assessment\QuestionBankController;
use App\Http\Controllers\Assessment\QuestionSelectionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::get('examinations-office', ExaminationsOfficeController::class)->name('assessment.office');

    Route::prefix('courses/{offering}/assessments')->group(function (): void {
        Route::get('/', AssessmentDeskController::class)->name('assessment.desk');
        Route::post('/', [AssessmentSetupController::class, 'book'])->name('assessment.activate');
    });

    Route::prefix('assessment-items/{item}')->group(function (): void {
        Route::post('assignment', [AssessmentSetupController::class, 'assignment'])->name('assessment.assignment.create');
        Route::post('exam', [ExamAuthorController::class, 'create'])->name('assessment.exam.create');
        Route::post('score', [GradebookController::class, 'score'])->name('assessment.score.record');
        Route::get('questions/select', QuestionSelectionController::class)->name('assessment.questions.select');
    });

    Route::prefix('courses/{offering}/question-banks')->controller(QuestionBankController::class)->group(function (): void {
        Route::get('/', 'index')->name('assessment.question-banks.index');
        Route::post('/', 'store')->name('assessment.question-banks.store');
    });

    Route::prefix('courses/{offering}/questions/{question}')->controller(QuestionBankController::class)->group(function (): void {
        Route::get('/', 'show')->name('assessment.questions.show');
        Route::get('edit', 'edit')->name('assessment.questions.edit');
        Route::put('/', 'update')->name('assessment.questions.update');
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

        Route::prefix('integrity')->controller(ExamIntegrityController::class)->group(function (): void {
            Route::get('/', 'show')->name('assessment.integrity');
            Route::post('/', 'configure')->name('assessment.integrity.configure');
            Route::post('signals/{signal}/review', 'review')->name('assessment.integrity.review');
        });
    });

    Route::prefix('attempts/{attempt}')->group(function (): void {
        Route::get('/', [ExamSessionController::class, 'show'])->name('assessment.paper');
        Route::put('answers/{question}', [ExamSessionController::class, 'save'])->name('assessment.save');
        Route::post('finish', [ExamSessionController::class, 'finish'])->name('assessment.finish');
        Route::get('review', [ExamAuthorController::class, 'script'])->name('assessment.script');
        Route::post('review', [ExamAuthorController::class, 'mark'])->name('assessment.mark');
        Route::post('visibility-signal', [ExamIntegrityController::class, 'signal'])
            ->middleware('throttle:20,1')->name('assessment.integrity.signal');
    });

    Route::controller(GradebookController::class)->group(function (): void {
        Route::get('grades/{grade}/evidence', ModerationEvidenceController::class)->name('assessment.evidence');
        Route::post('gradebooks/{book}/compute/{enrolment}', 'compute')->name('assessment.compute');
        Route::post('grades/{grade}/review', 'review')->name('assessment.moderate');
        Route::get('grades/{grade}/sheet', 'sheet')->name('assessment.sheet');
    });
});
