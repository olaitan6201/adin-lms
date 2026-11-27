<?php

use App\Enums\StructureRegisterKind;
use App\Http\Controllers\Admin\AccountDirectoryController;
use App\Http\Controllers\Admin\AccountGrantsController;
use App\Http\Controllers\Admin\OverviewController;
use App\Http\Controllers\Admin\QualityController;
use App\Http\Controllers\Admin\StructureController;
use App\Http\Controllers\Admin\StructureImportController;
use App\Http\Controllers\Admin\StructureRegisterController;
use App\Models\User;
use App\Services\Academics\HierarchyChanges;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'admin'])->group(function (): void {
    Route::prefix('admin')->group(function (): void {
        Route::get('overview', OverviewController::class)
            ->middleware(['can:view-admin-overview', 'cache.headers:private;no_store'])
            ->name('admin.overview');
        Route::get('qa', QualityController::class)
            ->middleware('can:view-quality-assurance')
            ->name('quality.index');
        Route::prefix('structure')
            ->name('admin.structure')
            ->controller(StructureController::class)
            ->middleware(['can:manage-academic-structure', 'cache.headers:private;no_store'])
            ->group(function (): void {
                Route::get('/', 'index')->name('');
                Route::post('records/{kind}', 'store')
                    ->whereIn('kind', HierarchyChanges::KINDS)
                    ->name('.store');
                Route::patch('records/{kind}/{record}', 'update')
                    ->whereIn('kind', HierarchyChanges::KINDS)
                    ->whereUuid('record')
                    ->name('.update');
            });
        Route::prefix('structure/register')
            ->name('admin.structure.register.')
            ->controller(StructureRegisterController::class)
            ->middleware(['can:manage-academic-structure', 'cache.headers:private;no_store'])
            ->group(function (): void {
                Route::post('{kind}', 'store')
                    ->whereIn('kind', StructureRegisterKind::cases())
                    ->name('store');
                Route::patch('{kind}/{record}', 'update')
                    ->whereIn('kind', [StructureRegisterKind::Programme, StructureRegisterKind::Level, StructureRegisterKind::Specialization])
                    ->whereUuid('record')
                    ->name('update');
            });
        Route::prefix('structure/import')
            ->name('admin.structure.import.')
            ->controller(StructureImportController::class)
            ->middleware(['can:manage-academic-structure', 'throttle:30,1', 'cache.headers:private;no_store'])
            ->group(function (): void {
                Route::get('template', 'template')->name('template');
                Route::post('columns', 'columns')->name('columns');
                Route::post('preview', 'preview')->name('preview');
                Route::post('/', 'store')->name('store');
            });
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
