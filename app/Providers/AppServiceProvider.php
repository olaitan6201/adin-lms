<?php

namespace App\Providers;

use App\Services\Academics\AcademicNavigation;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
        Inertia::share('academicLinks', Inertia::always(fn () => app(AcademicNavigation::class)->forUser(request()->user())));
    }
}
