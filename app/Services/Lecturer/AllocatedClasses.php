<?php

namespace App\Services\Lecturer;

use App\Enums\PermissionCode;
use App\Enums\RoleCode;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

final class AllocatedClasses
{
    public static function forUser(User $user): Builder
    {
        return DB::table('teaching_allocations')
            ->join('lecturers', 'lecturers.id', '=', 'teaching_allocations.lecturer_id')
            ->join('access_scopes', 'access_scopes.offering_id', '=', 'teaching_allocations.offering_id')
            ->join('role_grants', 'role_grants.scope_id', '=', 'access_scopes.id')
            ->join('roles', 'roles.id', '=', 'role_grants.role_id')
            ->join('role_permissions', 'role_permissions.role_id', '=', 'roles.id')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->where('lecturers.user_id', $user->id)
            ->where('role_grants.user_id', $user->id)
            ->where('roles.code', RoleCode::Lecturer)
            ->where('permissions.code', PermissionCode::RosterRead)
            ->select('teaching_allocations.offering_id');
    }
}
