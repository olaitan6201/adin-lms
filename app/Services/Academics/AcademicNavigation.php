<?php

namespace App\Services\Academics;

use App\Models\User;
use App\Services\Authority\RoleCatalogue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

class AcademicNavigation
{
    /** @return list<array{label:string, href:string}> */
    public function forUser(?User $user): array
    {
        if (! $user || $user->status !== 'active') {
            return [];
        }

        $permissions = DB::table('role_grants')
            ->where('user_id', $user->id)
            ->join('roles', 'roles.id', '=', 'role_grants.role_id')
            ->join('role_permissions', 'role_permissions.role_id', '=', 'roles.id')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->join('access_scopes', 'access_scopes.id', '=', 'role_grants.scope_id')
            ->get(['roles.code as role', 'permissions.code as ability', 'access_scopes.scope_key']);
        $institution = $permissions
            ->filter(
                fn ($grant) => $grant->scope_key === 'institution' &&
                    RoleCatalogue::scopeType($grant->role) === 'institution',
            )
            ->pluck('ability');
        $oversight = $permissions->contains(
            fn ($grant) => $grant->ability === 'roster.read' &&
                match ($grant->role) {
                    'dean' => str_starts_with($grant->scope_key, 'faculty:'),
                    'head_of_department' => str_starts_with($grant->scope_key, 'department:'),
                    default => false,
                },
        );
        $student = $user->student()->exists();
        $calendar = $student || $oversight || $institution->intersect([
            'courses.read_own', 'roster.read', 'academics.manage', 'offerings.manage',
            'examinations.manage', 'curriculum.edit', 'curriculum.approve', 'compliance.read', 'operations.manage',
        ])->isNotEmpty() || $user->lecturer()->exists();

        return array_values(
            array_filter([
                $institution->contains('examinations.manage')
                    ? ['label' => 'Examinations office', 'href' => route('assessment.office', [], false)]
                    : null,
                $oversight || $institution->contains('academics.manage')
                    ? ['label' => 'Organisation', 'href' => route('academics.index', [], false)]
                    : null,
                $institution
                    ->intersect(['curriculum.edit', 'curriculum.approve', 'compliance.read'])
                    ->isNotEmpty()
                    ? ['label' => 'Curriculum', 'href' => route('academics.curriculum.show', [], false)]
                    : null,
                $institution->contains('offerings.manage')
                    ? ['label' => 'Delivery', 'href' => route('academics.delivery', [], false)]
                    : null,
                $this->link('Student directory', 'students.index', $institution->contains('roster.read')),
                $this->link('Staff directory', 'staff.index', $institution->contains('staff.manage')),
                $this->link('Guardian progress', 'guardian.index', $institution->contains('progress.read_approved')),
                $this->link('Calendar', 'insights.calendar', $calendar),
                $this->link('Quality review', 'quality.index', $institution->contains('compliance.read')),
                $this->link('Downloads', 'student.downloads', $student),
                $this->link('Notification settings', 'community.notifications.settings'),
            ]),
        );
    }

    /** @return array{label:string, href:string}|null */
    private function link(string $label, string $route, bool $allowed = true): ?array
    {
        return $allowed && Route::has($route) ? ['label' => $label, 'href' => route($route, absolute: false)] : null;
    }
}
