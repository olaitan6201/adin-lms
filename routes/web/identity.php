<?php

use App\Http\Controllers\PasswordRecoveryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Security\ActiveSessionController;
use App\Http\Controllers\Security\ChallengeController;
use App\Http\Controllers\Security\LoginHistoryController;
use App\Http\Controllers\SessionController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [SessionController::class, 'create'])->name('login');
    Route::post('/login', [SessionController::class, 'store'])
        ->middleware('throttle:6,1,login')
        ->name('login.store');
    Route::get('/forgot-password', [PasswordRecoveryController::class, 'requestLink'])->name('password.request');
    Route::post('/forgot-password', [PasswordRecoveryController::class, 'send'])->middleware('throttle:6,1,recovery')->name('password.email');
    Route::get('/reset-password/{token}', [PasswordRecoveryController::class, 'edit'])->name('password.reset');
    Route::post('/reset-password', [PasswordRecoveryController::class, 'update'])->middleware('throttle:6,1,reset')->name('password.update');
});

Route::middleware('auth')->group(function (): void {
    Route::post('/logout', [SessionController::class, 'destroy'])->name('logout');

    Route::prefix('profile')->controller(ProfileController::class)->name('profile.')->group(function (): void {
        Route::get('/', 'edit')->name('edit');
        Route::patch('/', 'update')->name('update');
    });

    Route::prefix('security')->name('security.')->group(function (): void {
        Route::prefix('challenge')->controller(ChallengeController::class)->group(function (): void {
            Route::get('/', 'show')->name('challenge');
            Route::post('/', 'verify')->middleware('throttle:6,1,mfa')->name('verify');
        });

        Route::get('login-events', LoginHistoryController::class)->name('events');

        Route::prefix('sessions')->controller(ActiveSessionController::class)->group(function (): void {
            Route::get('/', 'index')->name('sessions');
            Route::delete('{session}', 'destroy')->whereUuid('session')->name('sessions.revoke');
        });
    });
});
