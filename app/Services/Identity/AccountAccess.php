<?php

namespace App\Services\Identity;

use App\Enums\AccountStatus;
use App\Enums\RoleCode;
use App\Enums\ScopeType;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Offering;
use App\Models\RoleGrant;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

final class AccountAccess
{
    public function __construct(private readonly ChangeRoleGrant $changes) {}

    public function details(User $actor, User $target): array
    {
        $grants = RoleGrant::where('user_id', $target->id)
            ->with(['role', 'accessScope.faculty', 'accessScope.department', 'accessScope.offering'])
            ->get();
        $permissions = DB::table('role_permissions')
            ->join('permissions', 'permission_id', '=', 'permissions.id')
            ->orderBy('permissions.code')
            ->get(['role_id', 'permissions.code'])
            ->groupBy('role_id');
        $gate = Gate::forUser($actor);

        return [
            'account' => $target,
            'editable' => $gate->allows('manageGrants', $target),
            'grants' => $grants,
            'permissions' => $permissions,
        ];
    }

    public function grant(User $actor, User $target, RoleCode $role, string $reference): void
    {
        $this->change($actor, $target, function () use ($actor, $target, $role, $reference): void {
            $scope = $this->resolveScope($role->scope(), $reference);
            $this->changes->apply($target->id, $role, $scope, false, $actor->id);
        });
    }

    public function revoke(User $actor, User $target, string $grant): void
    {
        $this->change($actor, $target, function () use ($actor, $target, $grant): void {
            $record = RoleGrant::where('user_id', $target->id)
                ->findOrFail($grant);
            $this->changes->apply(
                $target->id,
                $record->role->code,
                $record->accessScope->scope_key,
                true,
                $actor->id,
            );
        });
    }

    private function resolveScope(ScopeType $scope, string $reference): string
    {
        if ($scope === ScopeType::Institution) {
            return $scope->key();
        }

        [$model, $column] = match ($scope) {
            ScopeType::Faculty => [Faculty::class, 'code'],
            ScopeType::Department => [Department::class, 'code'],
            ScopeType::Offering => [Offering::class, 'external_offering_id'],
        };
        $id = $model::where($column, $reference)
            ->value('id');
        if (! $id) {
            throw ValidationException::withMessages(['reference' => "Unknown {$scope->value} reference."]);
        }

        return $scope->key($id);
    }

    private function change(User $actor, User $target, Closure $operation): void
    {
        DB::transaction(function () use ($actor, $target, $operation): void {
            $accounts = User::whereKey([$target->id, $actor->id])
                ->orderBy('id')
                ->lockForUpdate()
                ->get();
            $lockedActor = $accounts->find($actor->id);
            abort_unless(
                $lockedActor?->status === AccountStatus::Active
                && $lockedActor->auth_version === $actor->auth_version,
                403,
            );

            $gate = Gate::forUser($lockedActor);
            $gate->authorize('manageGrants', $target);

            $operation();
        }, 3);
    }
}
