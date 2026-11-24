<?php

namespace App\Services\Academics;

use App\Models\User;
use App\Services\Authority\RoleCatalogue;
use Illuminate\Support\Facades\DB;

class AcademicNavigation
{
    /** @return list<array{label:string, href:string}> */
    public function forUser(?User $user): array
    {
        if (! $user || $user->status !== 'active') {
            return [];
        }
        $permissions = DB::table('role_grants')->where('user_id', $user->id)
            ->join('roles', 'roles.id', '=', 'role_grants.role_id')
            ->join('role_permissions', 'role_permissions.role_id', '=', 'roles.id')
            ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->join('access_scopes', 'access_scopes.id', '=', 'role_grants.scope_id')
            ->get(['roles.code as role', 'permissions.code as ability', 'access_scopes.scope_key']);
        $institution = $permissions->filter(fn ($grant) => $grant->scope_key === 'institution' && RoleCatalogue::scopeType($grant->role) === 'institution')->pluck('ability');
        $oversight = $permissions->contains(fn ($grant) => $grant->ability === 'roster.read' && match ($grant->role) {
            'dean' => str_starts_with($grant->scope_key, 'faculty:'), 'head_of_department' => str_starts_with($grant->scope_key, 'department:'), default => false,
        });

        return array_values(array_filter([
            $oversight || $institution->contains('academics.manage') ? ['label' => 'Organisation', 'href' => route('academics.index', [], false)] : null,
            $institution->intersect(['curriculum.edit', 'curriculum.approve', 'compliance.read'])->isNotEmpty() ? ['label' => 'Curriculum', 'href' => route('academics.curriculum.show', [], false)] : null,
            $institution->contains('offerings.manage') ? ['label' => 'Delivery', 'href' => route('academics.delivery', [], false)] : null,
        ]));
    }
}
