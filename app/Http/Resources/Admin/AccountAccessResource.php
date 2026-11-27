<?php

namespace App\Http\Resources\Admin;

use App\Enums\RoleCode;
use App\Models\RoleGrant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AccountAccessResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $details = $this->resource;
        $roles = array_map(fn (RoleCode $role): array => [
            'code' => $role->value,
            'scope' => $role->scope()->value,
        ], RoleCode::cases());

        $grants = $details['grants']->map(function (RoleGrant $grant) use ($details): array {
            $permissions = $details['permissions']->get($grant->role_id, collect());

            return ['grant' => $grant, 'permissions' => $permissions->pluck('code')];
        });

        $records = AccountGrantResource::collection($grants);

        return [
            'account' => $details['account']->only('id', 'full_name', 'email'),
            'editable' => $details['editable'],
            'roles' => $roles,
            'grants' => $records->resolve($request),
        ];
    }
}
