<?php

namespace App\Services\Identity;

use App\Jobs\SendAccountResetLink;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;

class AccountAdministration
{
    public function __construct(private readonly ScopedAuthority $authority, private readonly AccountLookup $lookup) {}

    public function provision(string $actorId, string $email, string $name): User
    {
        $user = DB::transaction(function () use ($actorId, $email, $name): User {
            $this->authorize($actorId);
            if ($this->lookup->emailQuery($email)->exists()) {
                throw new DomainException('An account already uses this email.');
            }
            $user = User::create(['email' => $email, 'full_name' => $name]);
            $this->record($actorId, $user, 'account.provisioned');

            return $user;
        });
        SendAccountResetLink::dispatch($user->email);

        return $user;
    }

    public function changeStatus(string $actorId, string $userId, bool $suspend): void
    {
        DB::transaction(function () use ($actorId, $userId, $suspend): void {
            $this->authorize($actorId);
            $user = User::lockForUpdate()->find($userId);
            if (! $user) {
                throw new DomainException('Unknown account.');
            }
            $status = $suspend ? 'suspended' : 'active';
            if ($user->status !== $status) {
                $user->status = $status;
                $user->auth_version++;
                $user->setRememberToken(null);
                $user->save();
                Password::broker()->deleteToken($user);
                $this->record($actorId, $user, $suspend ? 'account.suspended' : 'account.reactivated');
            }
        }, 3);
    }

    private function authorize(string $actorId): void
    {
        $actor = User::lockForUpdate()->find($actorId);
        if ($actor?->status !== 'active' || ! $this->authority->institutionAllows($actor, 'accounts.manage')) {
            throw new DomainException('An active institutional account administrator is required.');
        }
    }

    private function record(string $actor, User $user, string $action): void
    {
        AuditLog::forceCreate(['actor_id' => $actor, 'subject_key' => 'user:'.$user->id, 'action' => $action, 'occurred_at' => now()]);
    }
}
