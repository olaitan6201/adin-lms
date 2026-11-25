<?php

use App\Http\Controllers\StudentAccountLinkController;
use App\Http\Controllers\StudentDirectoryController;
use App\Http\Controllers\StudentPhotoController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('students')->name('students.')->controller(StudentDirectoryController::class)->group(function (): void {
    Route::get('/', 'index')->name('index');
    Route::get('{student}/photo', StudentPhotoController::class)->whereUuid('student')->can('viewHistory', 'student')->name('photo');
    Route::post('link', StudentAccountLinkController::class)->name('link');
    Route::post('feeds/{kind}', 'import')->whereIn('kind', ['registrations', 'profiles'])->middleware('throttle:10,1')->name('feeds.import');
});
