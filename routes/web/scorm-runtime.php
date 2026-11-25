<?php

use App\Http\Controllers\ScormRuntime\ReadingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'throttle:60,1'])->prefix('courses/{offering}/scorm')
    ->whereUuid('offering')->name('scorm.')->controller(ReadingController::class)->group(function (): void {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->middleware('throttle:10,1')->name('store');
        Route::post('{package}/launch', 'launch')->whereUuid('package')->name('launch');
        Route::post('{package}/progress', 'save')->whereUuid('package')->name('save');
    });
