<?php

namespace App\Http\Middleware;

use App\Enums\AccountStatus;
use Closure;
use Illuminate\Auth\SessionGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveAccount
{
    public const VERSION = 'auth_version';

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user === null) {
            return $next($request);
        }

        /** @var SessionGuard $guard */
        $guard = Auth::guard('web');
        $account = $user->fresh();
        $persisted = $request->session()->has($guard->getName());

        if ($account?->status !== AccountStatus::Active || ($persisted && $request->session()->get(self::VERSION) !== $account->auth_version)) {
            $guard->logoutCurrentDevice();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return to_route('login');
        }

        return $next($request);
    }
}
