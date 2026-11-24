<?php

use App\Http\Controllers\Security\ChallengeController;
use App\Http\Controllers\Security\LoginHistoryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('security')->name('security.')->group(function (): void {
    Route::get('challenge', [ChallengeController::class, 'show'])->name('challenge');
    Route::post('challenge', [ChallengeController::class, 'verify'])->middleware('throttle:6,1,mfa')->name('verify');
    Route::get('login-events', LoginHistoryController::class)->name('events');
});
