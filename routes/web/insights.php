<?php

use App\Http\Controllers\InsightController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::get('/reports', [InsightController::class, 'page'])->name('insights.reports');
    Route::get('/dashboard', [InsightController::class, 'page'])->name('insights.dashboard');
    Route::get('/reports/export/{format}', [InsightController::class, 'export'])
        ->whereIn('format', ['pdf', 'xlsx'])->name('insights.export');
});
