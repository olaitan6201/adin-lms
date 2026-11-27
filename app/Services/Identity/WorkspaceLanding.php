<?php

namespace App\Services\Identity;

use App\Enums\PermissionCode;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class WorkspaceLanding
{
    public function __construct(private ScopedAuthority $authority, private Router $router) {}

    public function afterPassword(Request $request): RedirectResponse
    {
        $intended = $request->session()->get('url.intended');
        if (is_string($intended) && $this->isAdminDestination($intended)) {
            $request->session()->forget('url.intended');
        }

        return redirect()->intended(route($this->routeName($request->user())));
    }

    public function routeName(?User $user): string
    {
        if (! $user) {
            return 'login';
        }

        return $this->authority->institutionAllows($user, PermissionCode::RosterRead)
            && $this->authority->canAccessAdminWorkspace($user)
            ? 'admin.overview'
            : 'insights.dashboard';
    }

    private function isAdminDestination(string $url): bool
    {
        try {
            $route = $this->router->getRoutes()->match(Request::create($url));
        } catch (NotFoundHttpException|MethodNotAllowedHttpException) {
            return false;
        }

        return in_array('admin', $route->middleware(), true);
    }
}
