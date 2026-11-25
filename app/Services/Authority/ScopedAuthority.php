<?php

namespace App\Services\Authority;

use App\Enums\PermissionCode;
use App\Enums\RoleCode;
use App\Enums\ScopeType;
use App\Models\Offering;
use App\Models\RoleGrant;
use App\Models\TeachingAllocation;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class ScopedAuthority
{
    public function requiresMfa(User $user): bool
    {
        return RoleGrant::where('user_id', $user->id)
            ->whereHas('role', fn (Builder $roles) => $roles->whereNotIn('code', [RoleCode::Student, RoleCode::Guardian]))
            ->exists();
    }

    public function institutionAllows(User $user, PermissionCode|string $permission): bool
    {
        $permission = $permission instanceof PermissionCode ? $permission : PermissionCode::tryFrom($permission);
        if ($permission === null) {
            return false;
        }
        $roles = array_values(array_filter(RoleCode::cases(), fn (RoleCode $role) => $role->scope() === ScopeType::Institution));

        return $this->hasGrant($user, $permission, ScopeType::Institution->key(), $roles);
    }

    public function rosterAllows(User $user, Offering $offering): bool
    {
        if ($this->institutionAllows($user, PermissionCode::RosterRead)) {
            return true;
        }
        if ($this->hasGrant($user, PermissionCode::RosterRead, ScopeType::Offering->key($offering->id), [RoleCode::Lecturer])
            && TeachingAllocation::where('offering_id', $offering->id)
                ->whereHas('lecturer', fn (Builder $query) => $query->where('user_id', $user->id))->exists()) {
            return true;
        }
        $department = $offering->curriculumCourse?->course?->department;

        return $department !== null && (
            $this->hasGrant($user, PermissionCode::RosterRead, ScopeType::Department->key($department->id), [RoleCode::HeadOfDepartment])
            || $this->hasGrant($user, PermissionCode::RosterRead, ScopeType::Faculty->key($department->faculty_id), [RoleCode::Dean])
        );
    }

    /** @param list<RoleCode> $roles */
    private function hasGrant(User $user, PermissionCode $permission, string $scope, array $roles): bool
    {
        return RoleGrant::where('role_grants.user_id', $user->id)
            ->join('roles', 'roles.id', '=', 'role_grants.role_id')
            ->join('role_permissions', 'role_permissions.role_id', '=', 'roles.id')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->join('access_scopes', 'access_scopes.id', '=', 'role_grants.scope_id')
            ->whereIn('roles.code', $roles)->where('permissions.code', $permission)
            ->where('access_scopes.scope_key', $scope)->exists();
    }
}
