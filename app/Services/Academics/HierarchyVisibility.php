<?php

namespace App\Services\Academics;

use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Support\Facades\DB;

class HierarchyVisibility
{
    public function records(User $user, ?string $department): array
    {
        $manage = app(ScopedAuthority::class)->institutionAllows($user, 'academics.manage');
        $departments = DB::table('departments');
        if (! $manage) {
            $grants = DB::table('role_grants')
                ->join('roles', 'roles.id', '=', 'role_grants.role_id')
                ->join('role_permissions', 'role_permissions.role_id', '=', 'roles.id')
                ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
                ->join('access_scopes', 'access_scopes.id', '=', 'role_grants.scope_id')
                ->where('user_id', $user->id)
                ->where('permissions.code', 'roster.read');
            $faculties = (clone $grants)->where('roles.code', 'dean')->pluck('faculty_id')->filter();
            $ids = (clone $grants)
                ->where('roles.code', 'head_of_department')
                ->pluck('department_id')
                ->filter();
            abort_if($faculties->isEmpty() && $ids->isEmpty(), 403);
            $departments->where(fn ($q) => $q->whereIn('faculty_id', $faculties)->orWhereIn('id', $ids));
        }

        if ($department !== null) {
            $departments->where('id', $department);
            abort_unless($departments->exists(), 404);
        }

        $departments = $departments->orderBy('name')->get();
        $facultyQuery = DB::table('faculties');
        if (! $manage || $department !== null) {
            $facultyQuery->whereIn(
                'id',
                $departments->pluck('faculty_id')->merge($department === null ? $faculties ?? [] : []),
            );
        }

        return [
            'manage' => $manage,
            'departments' => $departments,
            'faculties' => $facultyQuery->orderBy('name')->get(),
            'programmes' => DB::table('programmes')
                ->whereIn('department_id', $departments->pluck('id'))
                ->orderBy('name')
                ->get(),
            'levels' => DB::table('academic_levels')->orderBy('label')->get(),
            'sessions' => DB::table('academic_sessions')->orderByDesc('starts_on')->get(),
            'semesters' => DB::table('semesters')->orderBy('starts_on')->get(),
        ];
    }
}
