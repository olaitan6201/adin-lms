<?php

namespace App\Http\Controllers\Security;

use App\Enums\PermissionCode;
use App\Http\Controllers\Controller;
use App\Http\Resources\LoginEventResource;
use App\Models\LoginEvent;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoginHistoryController extends Controller
{
    public function __invoke(Request $request, ScopedAuthority $authority): Response
    {
        abort_unless($authority->institutionAllows($request->user(), PermissionCode::LoginEventsRead), 403);
        $events = LoginEvent::with('user:id,full_name')->orderByDesc('occurred_at')->orderByDesc('id')
            ->simplePaginate(50, ['id', 'user_id', 'occurred_at', 'outcome']);

        return Inertia::render('Security/LoginHistory', [
            'events' => LoginEventResource::collection($events->items())->resolve($request),
            'sessionsUrl' => $authority->institutionAllows($request->user(), PermissionCode::OperationsManage)
                ? route('security.sessions', [], false) : null,
            'previous' => $events->previousPageUrl(),
            'next' => $events->nextPageUrl(),
        ]);
    }
}
