<?php

use App\Http\Controllers\Academics\AcademicHierarchyController;
use App\Http\Controllers\Academics\CurriculumCatalogueController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('academics')->name('academics.')->group(function (): void {
    Route::get('/curriculum/{version?}', [CurriculumCatalogueController::class, 'index'])->whereUuid('version')->name('curriculum.show');
    Route::post('/curriculum', [CurriculumCatalogueController::class, 'store']);
    Route::post('/curriculum/{version}/{action}', [CurriculumCatalogueController::class, 'change'])->whereUuid('version')->whereIn('action', ['entry', 'prerequisite', 'course-outcome', 'programme-outcome', 'mapping', 'review', 'approve', 'fork']);
    Route::get('/', [AcademicHierarchyController::class, 'index'])->name('index');
    Route::get('/departments/{department}', [AcademicHierarchyController::class, 'index'])->whereUuid('department')->name('department');
    Route::post('/organisation/{kind}', [AcademicHierarchyController::class, 'store'])->whereIn('kind', ['faculties', 'departments', 'programmes', 'levels', 'sessions', 'semesters']);
    Route::delete('/departments/{department}', [AcademicHierarchyController::class, 'destroy'])->whereUuid('department');
});
