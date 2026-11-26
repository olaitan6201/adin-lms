<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\InsightController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->name('insights.')->group(function (): void {
    Route::get('/dashboard', [InsightController::class, 'dashboard'])->name('dashboard');
    Route::get('/calendar', CalendarController::class)->name('calendar');
});

Route::middleware('auth')->prefix('reports')->controller(ReportController::class)->name('insights.')->group(function (): void {
    Route::get('/', 'page')->name('reports');
    Route::get('/export/{format}', 'export')->name('export');
});
