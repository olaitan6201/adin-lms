<?php

use App\Http\Controllers\Assessment\ExamIntegrityController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->controller(ExamIntegrityController::class)->group(function (): void {
    Route::prefix('examinations/{exam}/integrity')->group(function (): void {
        Route::get('/', 'show')->name('assessment.integrity');
        Route::post('/', 'configure')->name('assessment.integrity.configure');
        Route::post('signals/{signal}/review', 'review')->name('assessment.integrity.review');
    });
    Route::post('attempts/{attempt}/visibility-signal', 'signal')
        ->middleware('throttle:20,1')->name('assessment.integrity.signal');
});
