<?php

use App\Http\Controllers\Academics\AcademicHierarchyController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('academics')->name('academics.')->group(function (): void {
    Route::get('/', [AcademicHierarchyController::class, 'index'])->name('index');
    Route::get('/departments/{department}', [AcademicHierarchyController::class, 'index'])->whereUuid('department')->name('department');
    Route::post('/organisation/{kind}', [AcademicHierarchyController::class, 'store'])->whereIn('kind', ['faculties', 'departments', 'programmes', 'levels', 'sessions', 'semesters']);
    Route::delete('/departments/{department}', [AcademicHierarchyController::class, 'destroy'])->whereUuid('department');
});
