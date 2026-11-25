<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

final class PortalAccessError
{
    public function __invoke(Response $original, Throwable $exception, Request $request): Response
    {
        $status = $original->getStatusCode();
        if (! in_array($status, [403, 404], true) || ! $request->hasSession()) {
            return $original;
        }

        // Machine consumers and provider callbacks keep their own response contract.
        $isVisit = $request->headers->has('X-Inertia');
        if (! $isVisit && (! $request->isMethod('GET') || ! $request->acceptsHtml() || $request->expectsJson())) {
            return $original;
        }

        $response = Inertia::render('AccessError', [
            'status' => $status,
            'returnTo' => $request->user() ? route('courses.index', absolute: false) : route('home', absolute: false),
        ])->toResponse($request);
        $response->setStatusCode($status);
        $response->headers->set('Cache-Control', 'private, no-store');

        return $response;
    }
}
