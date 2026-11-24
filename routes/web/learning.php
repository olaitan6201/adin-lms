<?php

use App\Http\Controllers\Learning\ContentController;
use App\Http\Controllers\Learning\RevisionController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('courses/{offering}/learning')->name('learning.')->group(function (): void {
    Route::get('/', [ContentController::class, 'index'])->name('index');
    Route::post('lessons/{lesson?}', [ContentController::class, 'save'])->name('lessons.save');
    Route::post('lessons/{lesson}/complete', [ContentController::class, 'complete'])->name('complete');
    Route::post('lessons/{lesson}/materials/{material?}', [RevisionController::class, 'store'])->name('revisions.store');
    Route::get('files/{version}', [RevisionController::class, 'download'])->name('download');
});
