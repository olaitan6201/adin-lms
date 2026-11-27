<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AccountGrantResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $grant = $this->resource['grant'];
        $scope = $grant->accessScope;

        return [
            'id' => $grant->id,
            'role' => $grant->role->code->value,
            'scope' => $scope->faculty?->name
                ?? $scope->department?->name
                ?? $scope->offering?->external_offering_id
                ?? 'Institution',
            'permissions' => $this->resource['permissions'],
        ];
    }
}
