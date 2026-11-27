<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/admin/overview')->name('home');
Route::inertia('/portal', 'Portal/Home')->name('portal.home');
