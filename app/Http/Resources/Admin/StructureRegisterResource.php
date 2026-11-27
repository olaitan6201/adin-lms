<?php

namespace App\Http\Resources\Admin;

use App\Enums\StructureRegisterKind;
use App\Models\DomainModel;
use App\Services\Academics\StructureRegister;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;

final class StructureRegisterResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $fields = [
            'programmes' => ['id', 'code', 'name'],
            'levels' => ['id', 'code', 'label', 'position', 'academic_programme_id'],
            'specializations' => ['id', 'code', 'name', 'department_id'],
            'pathways' => ['id', 'academic_programme_id', 'specialization_id'],
        ];
        $props = [];
        foreach ($fields as $key => $allowed) {
            $props[$key] = $this->resource[$key]->map(function (DomainModel $model) use ($allowed, $key): array {
                $revision = $key === 'pathways' ? [] : ['revision' => StructureRegister::revision($model)];

                return Arr::only($model->attributesToArray(), $allowed) + $revision;
            })->all();
        }

        foreach (StructureRegisterKind::cases() as $kind) {
            $props['actions'][$kind->value] = route('admin.structure.register.store', $kind->value, false);
        }

        return $props;
    }
}
