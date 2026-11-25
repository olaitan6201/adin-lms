<?php

use App\Http\Controllers\GuardianPermissionController;
use App\Http\Controllers\GuardianProgressController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('guardian')->name('guardian.')->group(function (): void {
    Route::get('/', [GuardianProgressController::class, 'index'])->name('index');
    Route::prefix('permissions')->controller(GuardianPermissionController::class)->group(function (): void {
        Route::get('/', 'index')->name('permissions.index');
        Route::post('/', 'store')->name('permissions.store');
        Route::delete('{access}', 'destroy')->whereUuid('access')->name('permissions.destroy');
    });
});
