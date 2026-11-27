<?php

namespace App\Services\Academics;

use App\Enums\AccountStatus;
use App\Enums\CurriculumStatus;
use App\Enums\PermissionCode;
use App\Enums\RoleCode;
use App\Enums\ScopeType;
use App\Enums\StudentStatus;
use App\Models\AcademicSession;
use App\Models\Curriculum;
use App\Models\Lecturer;
use App\Models\RoleGrant;
use App\Models\StudentSession;
use Illuminate\Support\Collection;

final class StructureMetrics
{
    /**
     * @param  array{
     *     faculties: Collection, departments: Collection, programmes: Collection, sessions: Collection
     * }  $records  The hierarchy records already authorized for the caller.
     * @return array{
     *     facets: array<string, array<string, array<string, mixed>>>,
     *     student_count_session: array{id: string, label: string}|null,
     *     health: array{departments_with_active_hod: int, programmes_with_approved_curriculum: int}
     * }
     */
    public function forRecords(array $records): array
    {
        $facultyIds = $records['faculties']->pluck('id');
        $departmentIds = $records['departments']->pluck('id');
        $programmeIds = $records['programmes']->pluck('id');
        $deans = $this->activeNames(RoleCode::Dean, $facultyIds);
        $heads = $this->activeNames(RoleCode::HeadOfDepartment, $departmentIds);
        $programmeCounts = $records['programmes']->countBy('department_id');
        $lecturers = $this->lecturerCounts($departmentIds);
        $studentSession = $this->studentCountSession($records['sessions'], $programmeIds);
        $students = $studentSession === null ? collect() : $this->studentCounts($studentSession, $programmeIds);

        $facultyMetrics = [];
        foreach ($facultyIds as $id) {
            $facultyMetrics[$id] = ['dean_names' => $deans->get(ScopeType::Faculty->key($id), [])];
        }

        $departmentMetrics = [];
        foreach ($departmentIds as $id) {
            $departmentMetrics[$id] = [
                'hod_names' => $heads->get(ScopeType::Department->key($id), []),
                'programme_count' => $programmeCounts->get($id, 0),
                'active_lecturer_count' => (int) $lecturers->get($id, 0),
                'active_imported_student_count' => $studentSession === null ? null : (int) $students->get($id, 0),
            ];
        }

        return [
            'facets' => ['faculties' => $facultyMetrics, 'departments' => $departmentMetrics],
            'student_count_session' => $studentSession?->only('id', 'label'),
            'health' => [
                'departments_with_active_hod' => $heads->count(),
                'programmes_with_approved_curriculum' => Curriculum::query()
                    ->whereIn('programme_id', $programmeIds)
                    ->where('status', CurriculumStatus::Approved)
                    ->distinct()
                    ->count('programme_id'),
            ],
        ];
    }

    /** @return Collection<string, list<string>> */
    private function activeNames(RoleCode $role, Collection $ids): Collection
    {
        $scope = $role->scope();
        $scopeKeys = $ids->map(fn (string $id): string => $scope->key($id));

        return RoleGrant::query()
            ->join('roles', 'roles.id', '=', 'role_grants.role_id')
            ->join('role_permissions', 'role_permissions.role_id', '=', 'roles.id')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->join('access_scopes', 'access_scopes.id', '=', 'role_grants.scope_id')
            ->join('users', 'users.id', '=', 'role_grants.user_id')
            ->where('roles.code', $role)
            ->where('permissions.code', PermissionCode::RosterRead)
            ->where('users.status', AccountStatus::Active)
            ->whereIn('access_scopes.scope_key', $scopeKeys)
            ->orderBy('users.full_name')
            ->orderBy('users.id')
            ->get(['access_scopes.scope_key', 'users.full_name'])
            ->groupBy('scope_key')
            ->map(fn (Collection $holders): array => $holders->pluck('full_name')->all());
    }

    private function lecturerCounts(Collection $departmentIds): Collection
    {
        return Lecturer::query()
            ->whereIn('department_id', $departmentIds)
            ->whereRelation('user', 'status', AccountStatus::Active)
            ->groupBy('department_id')
            ->selectRaw('department_id, count(*) as total')
            ->pluck('total', 'department_id');
    }

    private function studentCountSession(Collection $sessions, Collection $programmeIds): ?AcademicSession
    {
        $today = now()->toDateString();
        $currentSessions = $sessions->filter(function (AcademicSession $session) use ($today): bool {
            return $session->starts_on->toDateString() <= $today && $session->ends_on->toDateString() >= $today;
        });

        if ($currentSessions->count() !== 1) {
            return null;
        }

        $session = $currentSessions->first();
        $hasProfiles = StudentSession::query()
            ->where('session_id', $session->id)
            ->whereIn('programme_id', $programmeIds)
            ->exists();

        return $hasProfiles ? $session : null;
    }

    private function studentCounts(AcademicSession $session, Collection $programmeIds): Collection
    {
        return StudentSession::query()
            ->join('programmes', 'programmes.id', '=', 'student_sessions.programme_id')
            ->where('student_sessions.session_id', $session->id)
            ->whereIn('student_sessions.programme_id', $programmeIds)
            ->whereRelation('student', 'status', StudentStatus::Active)
            ->groupBy('programmes.department_id')
            ->selectRaw('programmes.department_id as department_id, count(distinct student_sessions.student_id) as total')
            ->pluck('total', 'department_id');
    }
}
