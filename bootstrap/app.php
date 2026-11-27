<?php

use App\Http\Middleware\EnsureActiveAccount;
use App\Http\Middleware\EnsureSessionSecurity;
use App\Http\Responses\PortalAccessError;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: [
            __DIR__.'/../routes/web.php',
            __DIR__.'/../routes/web/academics.php',
            __DIR__.'/../routes/web/assessments.php',
            __DIR__.'/../routes/web/community.php',
            __DIR__.'/../routes/web/guardian.php',
            __DIR__.'/../routes/web/identity.php',
            __DIR__.'/../routes/web/insights.php',
            __DIR__.'/../routes/web/integrations.php',
            __DIR__.'/../routes/web/learning.php',
            __DIR__.'/../routes/web/operations.php',
            __DIR__.'/../routes/web/people.php',
            __DIR__.'/../routes/web/workspaces.php',
        ],
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [EnsureActiveAccount::class, EnsureSessionSecurity::class, Inertia\Middleware::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
        $exceptions->respond(new PortalAccessError);
    })->create();
