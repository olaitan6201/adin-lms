<?php

namespace App\Services\Identity;

use App\Enums\PermissionCode;
use App\Jobs\SendAccountResetLink;
use App\Models\AuditLog;
use App\Models\RoleGrant;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use App\Services\Security\WebSessions;
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
            if ($userId === $actorId || (RoleGrant::where('user_id', $userId)->whereHas('role', fn ($q) => $q
                ->whereIn('code', ['super_admin', 'ict_admin', 'institutional_admin']))->exists()
                && ! $this->authority->institutionAllows(User::findOrFail($actorId), PermissionCode::GrantsManage))) {
                throw new DomainException('You cannot change the status of this administrator account.');
            }

            if ($user->status !== $status) {
                $user->status = $status;
                $user->auth_version++;
                $user->setRememberToken(null);
                $user->save();
                WebSessions::revokeAll($user);
                Password::broker()->deleteToken($user);
                $this->record($actorId, $user, $suspend ? 'account.suspended' : 'account.reactivated');
            }
        }, 3);
    }

    private function authorize(string $actorId): void
    {
        $actor = User::lockForUpdate()->find($actorId);
        if ($actor?->status !== 'active' || ! $this->authority->institutionAllows($actor, PermissionCode::AccountsManage)) {
            throw new DomainException('An active institutional account administrator is required.');
        }
    }

    private function record(string $actor, User $user, string $action): void
    {
        AuditLog::forceCreate(['actor_id' => $actor, 'subject_key' => 'user:'.$user->id, 'action' => $action, 'occurred_at' => now()]);
    }
}
