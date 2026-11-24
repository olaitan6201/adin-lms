<?php

namespace App\Services\Security;

use App\Models\AuthSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WebSessions
{
    public function start(Request $request, User $user): void
    {
        $token = Str::random(64);
        AuthSession::forceCreate([
            'user_id' => $user->id, 'token_digest' => hash('sha256', $token),
            'last_seen' => now(), 'expires_at' => now()->addMinutes(config('session.lifetime')),
        ]);
        $request->session()->forget('security.mfa_user');
        $request->session()->put('security.token', $token);
    }

    public function touch(Request $request, User $user): bool
    {
        return DB::transaction(function () use ($request, $user): bool {
            $session = $this->matching($request, $user)->lockForUpdate()->first();
            if (! $session || $session->revoked_at !== null) {
                return false;
            }
            if ($session->expires_at->lte(now())) {
                $session->revoked_at = now();
                $session->save();
                AuthEvents::record($user, 'session.expired');

                return false;
            }
            $session->last_seen = now();
            $session->expires_at = now()->addMinutes(config('session.lifetime'));
            $session->save();

            return true;
        });
    }

    public function end(Request $request, User $user): void
    {
        $this->matching($request, $user)->whereNull('revoked_at')->update(['revoked_at' => now()]);
    }

    private function matching(Request $request, User $user): Builder
    {
        return AuthSession::where('user_id', $user->id)->where('token_digest', hash('sha256', (string) $request->session()->get('security.token')));
    }
}
