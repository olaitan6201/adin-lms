<?php

namespace App\Http\Middleware;

use App\Services\Authority\ScopedAuthority;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class EnsureAdminAccess
{
    public function __construct(private ScopedAuthority $authority) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user() && $this->authority->canAccessAdminWorkspace($request->user()), 403);

        return $next($request);
    }
}
