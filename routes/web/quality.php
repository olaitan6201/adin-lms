<?php

use App\Http\Controllers\QualityController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('admin')->group(function (): void {
    Route::get('/qa', QualityController::class)->name('quality.index');
});
