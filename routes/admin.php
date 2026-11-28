<?php

use App\Enums\StructureRegisterKind;
use App\Http\Controllers\Admin\AcademicCoreController;
use App\Http\Controllers\Admin\AcademicCourseRevisionController;
use App\Http\Controllers\Admin\AccountDirectoryController;
use App\Http\Controllers\Admin\AccountGrantsController;
use App\Http\Controllers\Admin\CurriculumAdoptionController;
use App\Http\Controllers\Admin\OverviewController;
use App\Http\Controllers\Admin\PathwayCurriculumController;
use App\Http\Controllers\Admin\QualityController;
use App\Http\Controllers\Admin\StructureController;
use App\Http\Controllers\Admin\StructureImportController;
use App\Http\Controllers\Admin\StructureRegisterController;
use App\Http\Controllers\Admin\StructureRegisterImportController;
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
        Route::prefix('structure/register/import')
            ->name('admin.structure.register.import.')
            ->controller(StructureRegisterImportController::class)
            ->middleware(['can:manage-academic-structure', 'throttle:30,1', 'cache.headers:private;no_store'])
            ->group(function (): void {
                Route::get('template', 'template')->name('template');
                Route::post('columns', 'columns')->name('columns');
                Route::post('preview', 'preview')->name('preview');
                Route::post('/', 'store')->name('store');
            });
    });

    Route::prefix('admin/academic-core')->name('admin.academic-core')
        ->middleware(['can:view-academic-core', 'cache.headers:private;no_store'])->group(function (): void {
            Route::get('/', [AcademicCoreController::class, 'index'])->name('');
            Route::controller(AcademicCourseRevisionController::class)->group(function (): void {
                Route::middleware('can:edit-academic-core')->group(function (): void {
                    Route::post('courses', 'storeCourse')->name('.courses.store');
                    Route::post('courses/{course}/revisions', 'store')->whereUuid('course')->name('.revisions.store');
                    Route::patch('revisions/{revision}', 'update')->whereUuid('revision')->name('.revisions.update');
                    Route::post('revisions/{revision}/review', 'review')->whereUuid('revision')->name('.revisions.review');
                });
                Route::post('revisions/{revision}/approve', 'approve')->whereUuid('revision')
                    ->middleware('can:approve-academic-core')->name('.revisions.approve');
            });
            Route::prefix('curricula')->name('.curricula.')->controller(PathwayCurriculumController::class)
                ->group(function (): void {
                    Route::middleware('can:edit-academic-core')->group(function (): void {
                        Route::post('/', 'store')->name('store');
                        Route::prefix('{curriculum}')->where(['curriculum' => '[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}'])->group(function (): void {
                            Route::post('assignments', 'assignment')->name('assignment');
                            Route::patch('assignments/{entry}', 'updateAssignment')->whereUuid('entry')->name('assignments.update');
                            Route::post('choices', 'choice')->name('choice');
                            Route::post('prerequisites', 'prerequisite')->name('prerequisite');
                            Route::post('course-outcomes', 'courseOutcome')->name('course-outcome');
                            Route::post('programme-outcomes', 'programmeOutcome')->name('programme-outcome');
                            Route::post('outcome-mappings', 'mapping')->name('mapping');
                            Route::post('review', 'review')->name('review');
                            Route::post('fork', 'fork')->name('fork');
                        });
                    });
                    Route::post('{curriculum}/approve', 'approve')->whereUuid('curriculum')
                        ->middleware('can:approve-academic-core')->name('approve');
                });
            Route::controller(CurriculumAdoptionController::class)->group(function (): void {
                Route::post('cohorts', 'cohort')->middleware('can:edit-academic-core')->name('.cohorts.store');
                Route::post('adoptions', 'store')->middleware('can:approve-academic-core')->name('.adoptions.store');
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
