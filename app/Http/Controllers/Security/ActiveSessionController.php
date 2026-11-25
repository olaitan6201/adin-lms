<?php

namespace App\Http\Controllers\Security;

use App\Http\Controllers\Controller;
use App\Enums\AuthenticationOutcome;
use App\Models\AuthSession;
use App\Models\AuditLog;
use App\Services\Authority\ScopedAuthority;
use App\Services\Security\AuthEvents;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ActiveSessionController extends Controller
{
    public function index(Request $request, ScopedAuthority $authority): Response
    {
        abort_unless($authority->institutionAllows($request->user(), 'operations.manage'), 403);
        $rows = AuthSession::join('users', 'users.id', '=', 'auth_sessions.user_id')
            ->whereNull('revoked_at')->where('expires_at', '>', now())->where('users.status', 'active')
            ->orderByDesc('last_seen')->orderBy('auth_sessions.id')
            ->simplePaginate(40, ['auth_sessions.id', 'full_name', 'email', 'last_seen', 'expires_at']);

        return Inertia::render('Security/Sessions', ['sessions' => $rows->items(), 'previous' => $rows->previousPageUrl(), 'next' => $rows->nextPageUrl()]);
    }

    public function destroy(Request $request, string $session, ScopedAuthority $authority): RedirectResponse
    {
        abort_unless($authority->institutionAllows($request->user(), 'operations.manage'), 403);
        DB::transaction(function () use ($session, $request): void {
            $row = AuthSession::whereNull('revoked_at')->where('expires_at', '>', now())->lockForUpdate()->findOrFail($session);
            $row->forceFill(['revoked_at' => now()])->save();
            AuthEvents::record($row->user, AuthenticationOutcome::SessionRevoked);
            AuditLog::forceCreate(['actor_id' => $request->user()->id, 'subject_key' => "session:$session",
                'action' => AuthenticationOutcome::SessionRevoked->value, 'occurred_at' => now()]);
        });

        return to_route('security.sessions');
    }
}
