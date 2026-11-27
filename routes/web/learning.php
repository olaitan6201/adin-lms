<?php

use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseSearchController;
use App\Http\Controllers\Learning\ClassroomController;
use App\Http\Controllers\Learning\ContentController;
use App\Http\Controllers\Learning\RegisterController;
use App\Http\Controllers\Learning\RevisionController;
use App\Http\Controllers\Learning\StudentDownloadsController;
use App\Http\Controllers\Learning\TeachingPlanController;
use App\Http\Controllers\OfferingRosterController;
use App\Http\Controllers\ScormRuntime\ReadingController;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Support\Facades\Route;

Route::get('student/downloads', StudentDownloadsController::class)
    ->middleware(['auth', 'cache.headers:private;no_store'])->name('student.downloads');

Route::middleware('auth')->group(function (): void {
    Route::prefix('courses')->controller(CourseController::class)->name('courses.')->group(function (): void {
        Route::get('/', 'index')->name('index');
        Route::get('{offering}', 'show')->whereUuid('offering')->name('show');
    });

    Route::get('offerings/{offering}/roster', OfferingRosterController::class)
        ->whereUuid('offering')->name('offerings.roster');
    Route::get('search', CourseSearchController::class)->name('mobile.search');
});

Route::middleware('auth')->prefix('courses/{offering}/learning')->name('learning.')->group(function (): void {
    Route::get('/', [ContentController::class, 'index'])->name('index');
    Route::prefix('teaching-plan')->controller(TeachingPlanController::class)->group(function (): void {
        Route::get('/', 'show')->name('plan');
        Route::post('/', 'submit')->name('plan.submit');
        Route::post('{plan}/review', 'review')->whereUuid('plan')->name('plan.review');
    });
    Route::put('sequence', [ContentController::class, 'order'])->name('sequence');
    Route::post('lessons/{lesson?}', [ContentController::class, 'save'])->name('lessons.save');
    Route::post('lessons/{lesson}/complete', [ContentController::class, 'complete'])->name('complete');
    Route::post('lessons/{lesson}/materials/{material?}', [RevisionController::class, 'store'])->name('revisions.store');
    Route::get('files/{version}', [RevisionController::class, 'download'])->name('download');
    Route::get('classes', [ClassroomController::class, 'index'])->name('classes');
    Route::post('classes/{session?}', [ClassroomController::class, 'save'])->name('classes.save');
    Route::post('classes/{session}/marks', [RegisterController::class, 'store'])->name('marks');
    Route::get('classes/{session}/register', [RegisterController::class, 'export'])->name('export');
});

Route::middleware(['auth', 'throttle:60,1'])->prefix('courses/{offering}/scorm')
    ->whereUuid('offering')->name('scorm.')->controller(ReadingController::class)->group(function (): void {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->middleware('throttle:10,1')->name('store');
        Route::post('{package}/launch', 'launch')->whereUuid('package')->name('launch');
        Route::post('{package}/progress', 'save')->whereUuid('package')->name('save');
    });

Route::post('learning-bridge/offerings/{offering}/classes/{session}/check-ins', [RegisterController::class, 'provider'])
    ->withoutMiddleware(PreventRequestForgery::class)
    ->middleware('throttle:120,1')->name('learning.provider');
