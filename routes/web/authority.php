<?php

use App\Http\Controllers\GuardianProgressController;
use App\Http\Controllers\OfferingRosterController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::get('/offerings/{offering}/roster', OfferingRosterController::class)
        ->whereUuid('offering')->name('offerings.roster');
    Route::get('/guardian/students/{student}/progress', GuardianProgressController::class)
        ->whereUuid('student')->name('guardian.progress');
});
