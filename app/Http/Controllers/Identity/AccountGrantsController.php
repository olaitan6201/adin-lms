<?php

namespace App\Http\Controllers\Identity;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Enums\RoleCode;
use App\Enums\ScopeType;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Offering;
use App\Models\RoleGrant;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AccountGrantsController extends Controller
{
    public function __construct(private readonly ScopedAuthority $authority, private readonly ChangeRoleGrant $changes) {}

    public function show(Request $request, User $account): Response
    {
        $this->authorizeAccess($request);
        $grants = RoleGrant::where('user_id', $account->id)->with(['role', 'accessScope.faculty', 'accessScope.department', 'accessScope.offering'])->get();
        $permissions = DB::table('role_permissions')->join('permissions', 'permission_id', '=', 'permissions.id')
            ->orderBy('permissions.code')->get(['role_id', 'permissions.code'])->groupBy('role_id');

        return Inertia::render('Identity/Access', [
            'account' => $account->only('id', 'full_name', 'email'),
            'editable' => $request->user()->id !== $account->id,
            'roles' => array_map(fn (RoleCode $role) => ['code' => $role->value, 'scope' => $role->scope()->value], RoleCode::cases()),
            'grants' => $grants->map(fn ($grant) => [
                'id' => $grant->id, 'role' => $grant->role->code->value,
                'scope' => $grant->accessScope->faculty?->name ?? $grant->accessScope->department?->name
                    ?? $grant->accessScope->offering?->external_offering_id ?? 'Institution',
                'permissions' => $permissions->get($grant->role_id, collect())->pluck('code'),
            ]),
        ]);
    }

    public function store(Request $request, User $account): RedirectResponse
    {
        $this->authorizeAccess($request, $account);
        $data = $request->validate(['role' => ['required', Rule::enum(RoleCode::class)], 'reference' => 'nullable|string|max:191']);
        $role = RoleCode::from($data['role']);
        $scope = $role->scope();
        $ref = $data['reference'] ?? '';
        $id = match ($scope) {
            ScopeType::Faculty => Faculty::where('code', $ref)->value('id'),
            ScopeType::Department => Department::where('code', $ref)->value('id'),
            ScopeType::Offering => Offering::where('external_offering_id', $ref)->value('id'),
            ScopeType::Institution => null,
        };
        if ($scope !== ScopeType::Institution && ! $id) {
            throw ValidationException::withMessages(['reference' => "Unknown {$scope->value} reference."]);
        }
        $this->changes->apply($account->id, $role, $scope->key($id), false, $request->user()->id);

        return back();
    }

    public function destroy(Request $request, User $account, string $grant): RedirectResponse
    {
        $this->authorizeAccess($request, $account);
        $record = RoleGrant::where('user_id', $account->id)->findOrFail($grant);
        $this->changes->apply($account->id, $record->role->code, $record->accessScope->scope_key, true, $request->user()->id);

        return back();
    }

    private function authorizeAccess(Request $request, ?User $target = null): void
    {
        abort_unless($this->authority->institutionAllows($request->user(), 'grants.manage') && $target?->id !== $request->user()->id, 403);
    }
}
