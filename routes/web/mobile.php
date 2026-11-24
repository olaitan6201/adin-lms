<?php

use App\Http\Controllers\CourseSearchController;
use Illuminate\Support\Facades\Route;

Route::get('/search', CourseSearchController::class)->middleware('auth')->name('mobile.search');
