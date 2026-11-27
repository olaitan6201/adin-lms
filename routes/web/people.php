<?php

use App\Http\Controllers\LecturerActivityController;
use App\Http\Controllers\LecturerDirectoryController;
use App\Http\Controllers\StudentAccountLinkController;
use App\Http\Controllers\StudentDirectoryController;
use App\Http\Controllers\StudentHistoryController;
use App\Http\Controllers\StudentPhotoController;
use App\Http\Controllers\TeachingAllocationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::prefix('staff')->name('staff.')->group(function (): void {
        Route::controller(LecturerDirectoryController::class)->group(function (): void {
            Route::get('/', 'index')->name('index');
            Route::post('/', 'store')->name('store');
            Route::patch('{lecturer}/department', 'transfer')->whereUuid('lecturer')->name('transfer');
        });

        Route::post('allocations', TeachingAllocationController::class)->name('allocations');
        Route::get('{lecturer}/activity', LecturerActivityController::class)->whereUuid('lecturer')->name('activity');
    });

    Route::prefix('students')->name('students.')->group(function (): void {
        Route::controller(StudentDirectoryController::class)->group(function (): void {
            Route::get('/', 'index')->name('index');
            Route::post('feeds/{kind}', 'import')
                ->whereIn('kind', ['registrations', 'profiles'])->middleware('throttle:10,1')->name('feeds.import');
        });

        Route::prefix('{student}')->whereUuid('student')->middleware('can:viewHistory,student')->group(function (): void {
            Route::get('history', StudentHistoryController::class)->name('history');
            Route::get('photo', StudentPhotoController::class)->name('photo');
        });

        Route::post('link', StudentAccountLinkController::class)->name('link');
    });
});
