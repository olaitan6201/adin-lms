<?php

use App\Http\Controllers\Academics\AcademicHierarchyController;
use App\Http\Controllers\Academics\CurriculumCatalogueController;
use App\Http\Controllers\Academics\OfferingDeliveryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('academics')->name('academics.')->group(function (): void {
    Route::controller(AcademicHierarchyController::class)->group(function (): void {
        Route::get('/', 'index')->name('index');
        Route::get('/departments/{department}', 'index')->whereUuid('department')->name('department');
        Route::delete('/departments/{department}', 'destroy')->whereUuid('department')->name('departments.destroy');
        Route::post('/organisation/{kind}', 'store')
            ->whereIn('kind', ['faculties', 'departments', 'programmes', 'levels', 'sessions', 'semesters'])
            ->name('organisation.store');
    });

    Route::controller(CurriculumCatalogueController::class)->prefix('curriculum')->group(function (): void {
        Route::get('/{version?}', 'index')->whereUuid('version')->name('curriculum.show');
        Route::post('/', 'store')->name('curriculum.store');
        Route::post('/{version}/{action}', 'change')->whereUuid('version')->whereIn('action', [
            'entry', 'prerequisite', 'course-outcome', 'programme-outcome', 'mapping', 'review', 'approve', 'fork',
        ])->name('curriculum.change');
    });

    Route::controller(OfferingDeliveryController::class)->prefix('delivery')->group(function (): void {
        Route::get('/', 'index')->name('delivery');
        Route::post('/{offering}/{action}', 'change')->whereUuid('offering')
            ->whereIn('action', ['prepare', 'publish', 'unpublish', 'archive', 'copy'])->name('delivery.change');
    });
});
