<?php

use App\Http\Controllers\Integrations\InstitutionLoginController;
use App\Http\Controllers\Integrations\LibraryController;
use App\Http\Controllers\Integrations\LtiController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('courses/{offering}/integrations')->name('integrations.')->group(function (): void {
    Route::get('/', [LibraryController::class, 'index'])->name('index');
    Route::get('library/{profile}', [LibraryController::class, 'open'])->name('library');
    Route::get('tools/{profile}', [LtiController::class, 'start'])->middleware('throttle:30,1')->name('launch');
});

Route::prefix('integrations/lti')->name('integrations.lti.')->group(function (): void {
    Route::get('keys', [LtiController::class, 'keys'])->name('keys');
    Route::get('authorize', [LtiController::class, 'authorize'])->middleware(['auth', 'throttle:60,1'])->name('authorize');
});

Route::middleware(['guest', 'throttle:30,1'])->prefix('integrations/oidc')->name('integrations.oidc.')->group(function (): void {
    Route::get('login', [InstitutionLoginController::class, 'start'])->name('login');
    Route::get('callback', [InstitutionLoginController::class, 'callback'])->name('callback');
});
