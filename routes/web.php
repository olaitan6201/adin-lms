<?php

use App\Http\Controllers\CourseController;
use App\Http\Controllers\StudentHistoryController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'Home')->name('home');
require __DIR__.'/web/profile.php';
require __DIR__.'/web/identity.php';
require __DIR__.'/web/security.php';
require __DIR__.'/web/authority.php';
Route::middleware('auth')->group(function () {
    Route::get('/students/{student}/history', StudentHistoryController::class)->whereUuid('student')->can('viewHistory', 'student')->name('students.history');
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/{offering}', [CourseController::class, 'show'])->whereUuid('offering')->name('courses.show');
});
