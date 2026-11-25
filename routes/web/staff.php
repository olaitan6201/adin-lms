<?php

use App\Http\Controllers\LecturerActivityController;
use App\Http\Controllers\LecturerDirectoryController;
use App\Http\Controllers\TeachingAllocationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('staff')->group(function (): void {
    Route::get('/', [LecturerDirectoryController::class, 'index'])->name('staff.index');
    Route::post('/', [LecturerDirectoryController::class, 'store'])->name('staff.store');
    Route::post('/allocations', TeachingAllocationController::class)->name('staff.allocations');
    Route::patch('{lecturer}/department', [LecturerDirectoryController::class, 'transfer'])->whereUuid('lecturer')->name('staff.transfer');
    Route::get('{lecturer}/activity', LecturerActivityController::class)->whereUuid('lecturer')->name('staff.activity');
});
