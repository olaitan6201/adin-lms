<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Symfony\Component\HttpFoundation\Response;

final readonly class BindAcademicDeskRecords
{
    public function __construct(private SubstituteBindings $bindings) {}

    public function handle(Request $request, Closure $next): Response
    {
        // Use normal Laravel binding, but only after the desk's session and ability checks.
        return $this->bindings->handle($request, $next);
    }
}
