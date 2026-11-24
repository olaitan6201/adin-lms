<?php

use App\Http\Controllers\CourseController;
use App\Http\Controllers\SessionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'Home')->name('home');
require __DIR__.'/web/profile.php';
Route::middleware('guest')->group(function () {
    Route::inertia('/login', 'Login')->name('login');
    Route::post('/login', [SessionController::class, 'store'])->middleware('throttle:6,1');
});
Route::middleware('auth')->group(function () {
    Route::post('/logout', [SessionController::class, 'destroy'])->name('logout');
    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/{offering}', [CourseController::class, 'show'])->whereUuid('offering')->name('courses.show');
});
