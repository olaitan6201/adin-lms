<?php

namespace App\Http\Middleware;

use App\Enums\PermissionCode;
use App\Services\Authority\ScopedAuthority;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class OperationsPermission
{
    public function __construct(private ScopedAuthority $authority) {}

    public static function requiring(PermissionCode $permission): string
    {
        return self::class.':'.$permission->value;
    }

    public function handle(Request $request, Closure $next, string $permission): Response
    {
        abort_unless($this->authority->institutionAllows($request->user(), $permission), 403);

        return $next($request);
    }
}
