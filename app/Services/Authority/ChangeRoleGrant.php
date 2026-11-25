<?php

namespace App\Services\Authority;

use App\Enums\RoleCode;
use App\Enums\ScopeType;
use App\Models\AccessScope;
use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Offering;
use App\Models\Role;
use App\Models\RoleGrant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class ChangeRoleGrant
{
    public function apply(string $userId, RoleCode|string $code, string $scopeKey, bool $revoke, ?string $actorId = null): void
    {
        $code = $code instanceof RoleCode ? $code : RoleCode::tryFrom($code);
        if ($code === null) {
            throw new InvalidArgumentException('Unknown role.');
        }
        DB::transaction(function () use ($userId, $code, $scopeKey, $revoke, $actorId): void {
            $user = Str::isUuid($userId) ? User::lockForUpdate()->find($userId) : null;
            $role = Role::where('code', $code)->first();
            if (! $user || ! $role) {
                throw new InvalidArgumentException('Unknown account or role. Seed the authority catalogue first.');
            }

            $attributes = $this->scopeAttributes($code, $scopeKey);
            $scope = AccessScope::where('scope_key', $scopeKey)->first();
            if (! $scope && $revoke) {
                return;
            }
            $scope ??= AccessScope::unguarded(fn () => AccessScope::firstOrCreate(['scope_key' => $scopeKey], $attributes));
            $key = ['role_id' => $role->id, 'user_id' => $user->id, 'scope_id' => $scope->id];
            $changed = $revoke
                ? RoleGrant::where($key)->delete()
                : RoleGrant::unguarded(fn () => RoleGrant::firstOrCreate($key))->wasRecentlyCreated;
            if ($changed) {
                $user->increment('auth_version');
                AuditLog::forceCreate([
                    'subject_key' => 'user:'.$user->id, 'occurred_at' => now(),
                    'action' => $revoke ? 'role.revoked' : 'role.granted',
                    'actor_id' => $actorId,
                    'details' => ['role' => $code->value, 'scope' => $scopeKey, 'source' => $actorId ? 'web' : 'console'],
                ]);
            }
        });
    }

    /** @return array<string, string> */
    private function scopeAttributes(RoleCode $code, string $key): array
    {
        $type = $code->scope();
        if ($type === ScopeType::Institution && $key === $type->key()) {
            return [];
        }
        [$prefix, $id] = array_pad(explode(':', $key, 2), 2, '');
        $model = match ($type) {
            ScopeType::Faculty => Faculty::class,
            ScopeType::Department => Department::class,
            ScopeType::Offering => Offering::class,
            ScopeType::Institution => null,
        };
        if (! $model || $prefix !== $type->value || ! Str::isUuid($id) || ! $model::whereKey($id)->exists()) {
            throw new InvalidArgumentException("Expected an existing {$type->value} scope for {$code->value}.");
        }

        return [$type->value.'_id' => $id];
    }
}
