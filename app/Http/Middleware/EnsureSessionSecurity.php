<?php

namespace App\Http\Middleware;

use App\Services\Authority\ScopedAuthority;
use App\Services\Security\WebSessions;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureSessionSecurity
{
    public function __construct(private WebSessions $sessions, private ScopedAuthority $authority) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }

        $guard = Auth::guard('web');
        if ($request->session()->has($guard->getName()) && ! $this->sessions->touch($request, $user)) {
            $guard->logoutCurrentDevice();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return to_route('login');
        }

        if (! $request->routeIs('security.challenge', 'security.verify', 'logout')
            && $request->session()->get('security.mfa_user') !== $user->id && $this->authority->requiresMfa($user)) {
            return to_route('security.challenge');
        }

        return $next($request);
    }
}
