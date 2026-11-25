<?php

use App\Http\Controllers\LecturerWorkloadController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('workload')->group(function (): void {
    Route::get('/', [LecturerWorkloadController::class, 'index'])->name('workload.index');
    Route::get('/classes/{offering}', [LecturerWorkloadController::class, 'show'])
        ->whereUuid('offering')
        ->name('workload.show');
});
