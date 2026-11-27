<?php

namespace App\Services\Academics;

use App\Enums\PermissionCode;
use App\Enums\RoleCode;
use App\Models\AcademicLevel;
use App\Models\AcademicSession;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Programme;
use App\Models\RoleGrant;
use App\Models\Semester;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Database\Eloquent\Builder;

class HierarchyVisibility
{
    public function records(User $user, ?string $department): array
    {
        $manage = app(ScopedAuthority::class)->institutionAllows($user, PermissionCode::AcademicsManage);
        $departments = Department::query();
        if (! $manage) {
            $grants = RoleGrant::query()
                ->join('roles', 'roles.id', '=', 'role_grants.role_id')
                ->join('role_permissions', 'role_permissions.role_id', '=', 'roles.id')
                ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
                ->join('access_scopes', 'access_scopes.id', '=', 'role_grants.scope_id')
                ->where('role_grants.user_id', $user->id)
                ->where('permissions.code', PermissionCode::RosterRead->value);
            $faculties = (clone $grants)
                ->where('roles.code', RoleCode::Dean->value)
                ->pluck('access_scopes.faculty_id')
                ->filter();
            $ids = (clone $grants)
                ->where('roles.code', RoleCode::HeadOfDepartment->value)
                ->pluck('access_scopes.department_id')
                ->filter();
            abort_if($faculties->isEmpty() && $ids->isEmpty(), 403);
            $departments->where(fn (Builder $query): Builder => $query->whereIn('faculty_id', $faculties)->orWhereIn('id', $ids));
        }

        if ($department !== null) {
            $departments->whereKey($department);
            abort_unless($departments->exists(), 404);
        }

        $departments = $departments->orderBy('name')->get();
        $facultyQuery = Faculty::query();
        if (! $manage || $department !== null) {
            $facultyQuery->whereIn(
                'id',
                $departments->pluck('faculty_id')->merge($department === null ? $faculties ?? [] : []),
            );
        }

        $calendarDates = ['starts_on' => 'immutable_date:Y-m-d', 'ends_on' => 'immutable_date:Y-m-d'];

        return [
            'manage' => $manage,
            'departments' => $departments,
            'faculties' => $facultyQuery->orderBy('name')->get(),
            'programmes' => Programme::query()
                ->whereIn('department_id', $departments->pluck('id'))
                ->orderBy('name')
                ->get(),
            'levels' => AcademicLevel::query()->orderBy('label')->get(),
            'sessions' => AcademicSession::query()->withCasts($calendarDates)->orderByDesc('starts_on')->get(),
            'semesters' => Semester::query()->withCasts($calendarDates)->orderBy('starts_on')->get(),
        ];
    }
}
