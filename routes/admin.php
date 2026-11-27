<?php

use App\Http\Controllers\Admin\AccountDirectoryController;
use App\Http\Controllers\Admin\AccountGrantsController;
use App\Http\Controllers\Admin\OverviewController;
use App\Http\Controllers\Admin\QualityController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin'])->group(function (): void {
    Route::prefix('admin')->group(function (): void {
        Route::get('overview', OverviewController::class)
            ->middleware(['can:view-admin-overview', 'cache.headers:private;no_store'])
            ->name('admin.overview');
        Route::get('qa', QualityController::class)
            ->middleware('can:view-quality-assurance')
            ->name('quality.index');
    });

    Route::prefix('accounts')
        ->name('accounts.')
        ->group(function (): void {
            Route::controller(AccountDirectoryController::class)
                ->group(function (): void {
                    Route::get('/', 'index')
                        ->can('viewAny', User::class)
                        ->name('index');
                    Route::post('/', 'store')
                        ->can('create', User::class)
                        ->middleware('throttle:20,1')
                        ->name('store');
                    Route::patch('{account}', 'update')
                        ->whereUuid('account')
                        ->can('updateStatus', User::class)
                        ->name('status');
                });

            Route::prefix('{account}/access')
                ->controller(AccountGrantsController::class)
                ->group(function (): void {
                    Route::get('/', 'show')
                        ->whereUuid('account')
                        ->can('viewAccess', User::class)
                        ->name('access');
                    Route::post('/', 'store')
                        ->whereUuid('account')
                        ->can('manageGrants', 'account')
                        ->name('access.grant');
                    Route::delete('{grant}', 'destroy')
                        ->whereUuid(['account', 'grant'])
                        ->can('manageGrants', 'account')
                        ->name('access.revoke');
                });
        });
});
