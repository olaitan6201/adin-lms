<?php

use App\Http\Controllers\Identity\AccountDirectoryController;
use App\Http\Controllers\Identity\AccountGrantsController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('accounts')->name('accounts.')->group(function (): void {
    Route::get('/', [AccountDirectoryController::class, 'index'])->name('index');
    Route::post('/', [AccountDirectoryController::class, 'store'])->middleware('throttle:20,1')->name('store');
    Route::patch('{account}', [AccountDirectoryController::class, 'update'])->whereUuid('account')->name('status');
    Route::prefix('{account}/access')->controller(AccountGrantsController::class)->group(function (): void {
        Route::get('/', 'show')->whereUuid('account')->name('access');
        Route::post('/', 'store')->whereUuid('account')->name('access.grant');
        Route::delete('{grant}', 'destroy')->whereUuid(['account','grant'])->name('access.revoke');
    });
});
