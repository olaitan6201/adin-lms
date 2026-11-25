<?php

use App\Http\Controllers\InsightController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->controller(InsightController::class)->name('insights.')->group(function (): void {
    Route::get('/dashboard', 'dashboard')->name('dashboard');
    Route::get('/reports', 'page')->name('reports');
    Route::get('/reports/export/{format}', 'export')->name('export');
});
