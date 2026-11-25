<?php

use App\Enums\PermissionCode;
use App\Http\Controllers\Operations\OperationsController;
use App\Http\Controllers\Operations\PortabilityController;
use App\Http\Controllers\Operations\PrivacyCaseFileController;
use App\Http\Controllers\Operations\PrivacyController;
use App\Http\Middleware\OperationsPermission;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'throttle:60,1,operations'])->prefix('operations')->name('operations.')->group(function (): void {
    Route::get('consent', [PrivacyController::class, 'show'])->name('consent.show');
    Route::post('consent', [PrivacyController::class, 'consent'])->name('consent');
    Route::middleware(OperationsPermission::requiring(PermissionCode::OperationsManage))->group(function (): void {
        Route::get('/', [OperationsController::class, 'index'])->name('index');
        Route::post('retention', [OperationsController::class, 'retention'])->name('retention');
        Route::post('infrastructure', [OperationsController::class, 'configure'])->name('infrastructure');
        Route::post('backup-evidence', [OperationsController::class, 'backup'])->name('backup');
    });
    Route::prefix('privacy')->controller(PrivacyController::class)->middleware(OperationsPermission::requiring(PermissionCode::PrivacyManage))->group(function (): void {
        Route::get('/', 'desk')->name('privacy');
        Route::post('cases', [PrivacyCaseFileController::class, 'store'])->name('cases.store');
        Route::post('cases/{case}', [PrivacyCaseFileController::class, 'advance'])->whereUuid('case')->name('cases.advance');
        Route::post('incidents', 'incident')->name('incident');
        Route::post('{subject}/approvals', 'approve')->whereUuid('subject')->name('approve');
        Route::post('{subject}/execute/{approval}', 'execute')->whereUuid(['subject', 'approval'])->name('execute');
    });
    Route::prefix('courses')->controller(PortabilityController::class)->middleware(OperationsPermission::requiring(PermissionCode::PortabilityManage))->group(function (): void {
        Route::get('/', 'desk')->name('courses');
        Route::post('{offering}/import', 'import')->whereUuid('offering')->name('import');
        Route::get('{offering}/export/{format}', 'export')->whereUuid('offering')->name('export');
    });
});
