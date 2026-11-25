<?php

namespace App\Providers;

use App\Services\Academics\AcademicNavigation;
use App\Services\Operations\InstitutionBranding;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\View;
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
        Inertia::share('branding', Inertia::always(fn () => app(InstitutionBranding::class)->display()));
        View::composer('scorm-runtime.layout', fn ($view) => $view->with('branding', app(InstitutionBranding::class)->display()));
        Inertia::share('signedIn', Inertia::always(fn () => auth()->check()));
        Inertia::share('academicLinks', Inertia::always(fn () => app(AcademicNavigation::class)->forUser(request()->user())));
    }
}
