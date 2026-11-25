<?php

use App\Http\Controllers\InsightController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->controller(InsightController::class)->name('insights.')->group(function (): void {
    Route::get('/dashboard', 'dashboard')->name('dashboard');
});

Route::middleware('auth')->prefix('reports')->controller(ReportController::class)->name('insights.')->group(function (): void {
    Route::get('/', 'page')->name('reports');
    Route::get('/export/{format}', 'export')->name('export');
});
