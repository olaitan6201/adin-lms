<?php

namespace App\Providers;

use App\Enums\PermissionCode;
use App\Models\User;
use App\Services\Academics\AcademicNavigation;
use App\Services\Academics\PortalIdentity;
use App\Services\Authority\ScopedAuthority;
use App\Services\Identity\WorkspaceLanding;
use App\Services\Operations\InstitutionBranding;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
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
    public function boot(PortalIdentity $identity, WorkspaceLanding $landing, ScopedAuthority $authority): void
    {
        Schema::defaultStringLength(191);
        Gate::define('view-admin-overview', fn (User $actor): bool => $authority->institutionAllows($actor, PermissionCode::RosterRead));
        Gate::define('view-quality-assurance', fn (User $actor): bool => $authority->institutionAllows($actor, PermissionCode::ComplianceRead));
        Gate::define('manage-academic-structure', fn (User $actor): bool => $authority->institutionAllows($actor, PermissionCode::AcademicsManage));

        Inertia::share('branding', Inertia::always(fn () => app(InstitutionBranding::class)->display()));
        View::composer('scorm-runtime.layout', fn ($view) => $view->with('branding', app(InstitutionBranding::class)->display()));
        Inertia::share('signedIn', Inertia::always(fn () => $identity->account(request()) !== null));
        Inertia::share('portalIdentity', Inertia::always(fn () => $identity->display($identity->account(request()))));
        Inertia::share('workspaceHome', Inertia::always(fn () => route(
            $landing->routeName($identity->account(request())),
            absolute: false,
        )));
        Inertia::share('academicLinks', Inertia::always(fn () => app(AcademicNavigation::class)->forUser($identity->account(request()))));

        Model::preventLazyLoading();
    }
}
