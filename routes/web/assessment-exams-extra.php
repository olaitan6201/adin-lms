<?php

use App\Http\Controllers\Assessment\QuestionBankController;
use App\Http\Controllers\Assessment\QuestionSelectionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::prefix('courses/{offering}/question-banks')->controller(QuestionBankController::class)->group(function (): void {
        Route::get('/', 'index')->name('assessment.question-banks.index');
        Route::post('/', 'store')->name('assessment.question-banks.store');
    });

    Route::prefix('courses/{offering}/questions/{question}')->controller(QuestionBankController::class)->group(function (): void {
        Route::get('/', 'show')->name('assessment.questions.show');
        Route::get('edit', 'edit')->name('assessment.questions.edit');
        Route::put('/', 'update')->name('assessment.questions.update');
    });

    Route::get('assessment-items/{item}/questions/select', QuestionSelectionController::class)
        ->name('assessment.questions.select');
});
