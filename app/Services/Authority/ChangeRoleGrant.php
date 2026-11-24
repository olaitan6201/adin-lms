<?php

namespace App\Services\Authority;

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
    public function apply(string $userId, string $code, string $scopeKey, bool $revoke, ?string $actorId = null): void
    {
        DB::transaction(function () use ($userId, $code, $scopeKey, $revoke, $actorId): void {
            $user = Str::isUuid($userId) ? User::lockForUpdate()->find($userId) : null;
            $role = Role::where('code', $code)->first();
            if (! $user || ! $role || ! isset(RoleCatalogue::MATRIX[$code])) {
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
                    'details' => ['role' => $code, 'scope' => $scopeKey, 'source' => $actorId ? 'web' : 'console'],
                ]);
            }
        });
    }

    /** @return array<string, string> */
    private function scopeAttributes(string $code, string $key): array
    {
        $type = RoleCatalogue::scopeType($code);
        if ($type === 'institution' && $key === 'institution') {
            return [];
        }
        [$prefix, $id] = array_pad(explode(':', $key, 2), 2, '');
        $model = match ($prefix) {
            'faculty' => Faculty::class,
            'department' => Department::class,
            'offering' => Offering::class,
            default => null,
        };
        if (! $model || $prefix !== $type || ! Str::isUuid($id) || ! $model::whereKey($id)->exists()) {
            throw new InvalidArgumentException("Expected an existing {$type} scope for {$code}.");
        }

        return [$type.'_id' => $id];
    }
}
