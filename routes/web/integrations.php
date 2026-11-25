<?php

use App\Http\Controllers\Integrations\LibraryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('courses/{offering}/integrations')->name('integrations.')->group(function (): void {
    Route::get('/', [LibraryController::class, 'index'])->name('index');
    Route::get('library/{profile}', [LibraryController::class, 'open'])->name('library');
});
