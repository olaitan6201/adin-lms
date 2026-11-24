<?php

use App\Http\Controllers\Operations\OperationsController;
use App\Http\Controllers\Operations\PortabilityController;
use App\Http\Controllers\Operations\PrivacyController;
use App\Http\Middleware\OperationsPermission;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'throttle:60,1,operations'])->prefix('operations')->name('operations.')->group(function (): void {
    Route::get('consent', [PrivacyController::class, 'show'])->name('consent.show');
    Route::post('consent', [PrivacyController::class, 'consent'])->name('consent');
    Route::middleware(OperationsPermission::class.':operations.manage')->group(function (): void {
        Route::get('/', [OperationsController::class, 'index'])->name('index');
        Route::post('retention', [OperationsController::class, 'retention'])->name('retention');
    });
    Route::middleware(OperationsPermission::class.':privacy.manage')->group(function (): void {
        Route::get('privacy', [PrivacyController::class, 'desk'])->name('privacy');
        Route::post('privacy/incidents', [PrivacyController::class, 'incident'])->name('incident');
        Route::post('privacy/{subject}/approvals', [PrivacyController::class, 'approve'])->whereUuid('subject')->name('approve');
        Route::post('privacy/{subject}/execute/{approval}', [PrivacyController::class, 'execute'])->whereUuid(['subject', 'approval'])->name('execute');
    });
    Route::middleware(OperationsPermission::class.':portability.manage')->group(function (): void {
        Route::get('courses', [PortabilityController::class, 'desk'])->name('courses');
        Route::post('courses/{offering}/import', [PortabilityController::class, 'import'])->whereUuid('offering')->name('import');
        Route::get('courses/{offering}/export/{format}', [PortabilityController::class, 'export'])
            ->whereUuid('offering')->whereIn('format', ['scorm', 'native'])->name('export');
    });
});
