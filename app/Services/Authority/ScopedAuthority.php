<?php

namespace App\Services\Authority;

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
            ->whereHas('role', fn (Builder $roles) => $roles->whereNotIn('code', ['student', 'guardian']))
            ->exists();
    }

    public function institutionAllows(User $user, string $permission): bool
    {
        $roles = array_keys(array_filter(RoleCatalogue::MATRIX,
            fn (string $role) => RoleCatalogue::scopeType($role) === 'institution', ARRAY_FILTER_USE_KEY));

        return $this->hasGrant($user, $permission, 'institution', $roles);
    }

    public function rosterAllows(User $user, Offering $offering): bool
    {
        if ($this->institutionAllows($user, 'roster.read')) {
            return true;
        }
        if ($this->hasGrant($user, 'roster.read', 'offering:'.$offering->id, ['lecturer'])
            && TeachingAllocation::where('offering_id', $offering->id)
                ->whereHas('lecturer', fn (Builder $query) => $query->where('user_id', $user->id))->exists()) {
            return true;
        }
        $department = $offering->curriculumCourse?->course?->department;

        return $department !== null && (
            $this->hasGrant($user, 'roster.read', 'department:'.$department->id, ['head_of_department'])
            || $this->hasGrant($user, 'roster.read', 'faculty:'.$department->faculty_id, ['dean'])
        );
    }

    /** @param list<string> $roles */
    private function hasGrant(User $user, string $permission, string $scope, array $roles): bool
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
