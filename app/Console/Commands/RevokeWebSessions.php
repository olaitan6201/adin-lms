<?php

namespace App\Console\Commands;

use App\Models\AuthSession;
use App\Models\User;
use App\Services\Security\AuthEvents;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RevokeWebSessions extends Command
{
    protected $signature = 'security:revoke-sessions {user : Account UUID} {--session= : Revoke only this session UUID}';

    protected $description = 'Revoke active web sessions for an account';

    public function handle(): int
    {
        $id = $this->argument('user');
        $user = Str::isUuid($id) ? User::find($id) : null;
        $session = $this->option('session');
        if (! $user || ($session !== null && ! Str::isUuid($session))) {
            $this->error('Invalid account or session.');

            return self::FAILURE;
        }
        $count = DB::transaction(function () use ($user, $session): int {
            $count = AuthSession::where('user_id', $user->id)->whereNull('revoked_at')
                ->when($session, fn ($query) => $query->whereKey($session))->update(['revoked_at' => now()]);
            if ($count > 0) {
                AuthEvents::record($user, 'session.revoked');
            }

            return $count;
        });
        $this->info("Revoked {$count} session(s).");

        return self::SUCCESS;
    }
}
