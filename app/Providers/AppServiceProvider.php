<?php

namespace App\Providers;

use App\Services\Academics\AcademicNavigation;
use App\Services\Academics\PortalIdentity;
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
    public function boot(PortalIdentity $identity): void
    {
        Schema::defaultStringLength(191);
        Inertia::share('branding', Inertia::always(fn () => app(InstitutionBranding::class)->display()));
        View::composer('scorm-runtime.layout', fn ($view) => $view->with('branding', app(InstitutionBranding::class)->display()));
        Inertia::share('signedIn', Inertia::always(fn () => $identity->account(request()) !== null));
        Inertia::share('portalIdentity', Inertia::always(fn () => $identity->display($identity->account(request()))));
        Inertia::share('academicLinks', Inertia::always(fn () => app(AcademicNavigation::class)->forUser($identity->account(request()))));
    }
}
