<?php

use App\Services\Identity\WorkspaceLanding;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', static fn (Request $request, WorkspaceLanding $landing): RedirectResponse => to_route(
    $landing->routeName($request->user()),
))->name('home');
Route::inertia('/portal', 'Portal/Home')->name('portal.home');
