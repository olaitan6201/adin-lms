<?php

namespace App\Services\Identity;

use App\Enums\AccountStatus;
use App\Enums\PermissionCode;
use App\Enums\RoleCode;
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
            $actor = User::lockForUpdate()
                ->find($actorId);
            $this->authorize($actor);
            $accounts = $this->lookup->emailQuery($email);
            
            if ($accounts->exists()) {
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
            $accounts = User::whereKey([$actorId, $userId])
                ->orderBy('id')
                ->lockForUpdate()
                ->get();
            $actor = $this->authorize($accounts->find($actorId));
            $user = $accounts->find($userId);
            if (! $user) {
                throw new DomainException('Unknown account.');
            }

            $status = $suspend ? AccountStatus::Suspended : AccountStatus::Active;
            $administrator = RoleGrant::where('user_id', $userId)
                ->whereHas('role', fn ($query) => $query->whereIn('code', [
                    RoleCode::SuperAdmin,
                    RoleCode::IctAdmin,
                    RoleCode::InstitutionalAdmin,
                ]))
                ->exists();
            if ($userId === $actorId || ($administrator
                && ! $this->authority->institutionAllows($actor, PermissionCode::GrantsManage))) {
                throw new DomainException('You cannot change the status of this administrator account.');
            }

            if ($user->status !== $status) {
                $user->status = $status;
                $user->auth_version++;
                $user->setRememberToken(null);
                $user->save();
                WebSessions::revokeAll($user);
                Password::deleteToken($user);
                $this->record($actorId, $user, $suspend ? 'account.suspended' : 'account.reactivated');
            }
        }, 3);
    }

    private function authorize(?User $actor): User
    {
        if ($actor?->status !== AccountStatus::Active || ! $this->authority->institutionAllows($actor, PermissionCode::AccountsManage)) {
            throw new DomainException('An active institutional account administrator is required.');
        }

        return $actor;
    }

    private function record(string $actor, User $user, string $action): void
    {
        AuditLog::forceCreate(['actor_id' => $actor, 'subject_key' => 'user:'.$user->id, 'action' => $action, 'occurred_at' => now()]);
    }
}
