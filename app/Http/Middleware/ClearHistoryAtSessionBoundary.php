<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Controller as InertiaPageController;
use Inertia\Inertia;
use Inertia\Support\Header;
use Inertia\Support\SessionKey;
use Symfony\Component\HttpFoundation\Response;

final class ClearHistoryAtSessionBoundary
{
    public function handle(Request $request, Closure $next): Response
    {
        $sessionId = $request->session()->getId();
        $actorId = $request->user()?->getAuthIdentifier();

        if ($request->isMethod('GET')
            && ($request->routeIs('security.challenge') || ($actorId === null && $this->isGuestPage($request)))) {
            Inertia::clearHistory();
        }

        $clearingHistory = $request->session()->get(SessionKey::CLEAR_HISTORY) === true;
        $response = $next($request);

        // Set the marker in the resulting session, not the one just invalidated.
        if ($sessionId !== $request->session()->getId() || $actorId !== $request->user()?->getAuthIdentifier()) {
            Inertia::clearHistory();
        }

        // A version refresh can discard the Inertia response that consumed the marker.
        if ($clearingHistory && $response->getStatusCode() === 409 && $response->headers->has(Header::LOCATION)) {
            Inertia::clearHistory();
        }

        return $response;
    }

    private function isGuestPage(Request $request): bool
    {
        // Direct Inertia pages include the public portal and workspace previews.
        $controller = ltrim($request->route()?->getControllerClass() ?? '', '\\');

        return $controller === InertiaPageController::class
            || $request->routeIs('login', 'password.request', 'password.reset');
    }
}
