<?php

use App\Http\Controllers\Learning\ClassroomController;
use App\Http\Controllers\Learning\ContentController;
use App\Http\Controllers\Learning\RegisterController;
use App\Http\Controllers\Learning\RevisionController;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('courses/{offering}/learning')->name('learning.')->group(function (): void {
    Route::get('/', [ContentController::class, 'index'])->name('index');
    Route::post('lessons/{lesson?}', [ContentController::class, 'save'])->name('lessons.save');
    Route::post('lessons/{lesson}/complete', [ContentController::class, 'complete'])->name('complete');
    Route::post('lessons/{lesson}/materials/{material?}', [RevisionController::class, 'store'])->name('revisions.store');
    Route::get('files/{version}', [RevisionController::class, 'download'])->name('download');
    Route::get('classes', [ClassroomController::class, 'index'])->name('classes');
    Route::post('classes/{session?}', [ClassroomController::class, 'save'])->name('classes.save');
    Route::post('classes/{session}/marks', [RegisterController::class, 'store'])->name('marks');
    Route::get('classes/{session}/register', [RegisterController::class, 'export'])->name('export');
});

Route::post('learning-bridge/offerings/{offering}/classes/{session}/check-ins', [RegisterController::class, 'provider'])
    ->withoutMiddleware(PreventRequestForgery::class)
    ->middleware('throttle:120,1')->name('learning.provider');
