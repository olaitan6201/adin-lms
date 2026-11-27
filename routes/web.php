<?php

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', static fn (Request $request): RedirectResponse => to_route(
    $request->user() ? 'insights.dashboard' : 'login',
))->name('home');
Route::inertia('/portal', 'Portal/Home')->name('portal.home');
