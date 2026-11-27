<?php

namespace App\Http\Resources\Admin;

use App\Services\Academics\HierarchyChanges;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;

final class AcademicStructureResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $fields = [
            'faculties' => ['id', 'code', 'name', 'dean_names'],
            'departments' => [
                'id', 'code', 'name', 'faculty_id', 'hod_names', 'programme_count',
                'active_lecturer_count', 'active_imported_student_count',
            ],
            'programmes' => ['id', 'code', 'name', 'department_id'],
            'levels' => ['id', 'label'],
            'sessions' => ['id', 'label', 'starts_on', 'ends_on'],
            'semesters' => ['id', 'session_id', 'position', 'starts_on', 'ends_on'],
        ];
        $props = [];
        $metrics = $this->resource['metrics'];
        foreach ($fields as $kind => $keys) {
            $props[$kind] = $this->resource[$kind]
                ->map(fn (Model $record): array => Arr::only(
                    $record->attributesToArray() + ($metrics['facets'][$kind][$record->getKey()] ?? []),
                    $keys,
                ))
                ->all();
        }
        foreach (HierarchyChanges::KINDS as $kind) {
            $props['actions'][$kind] = route('admin.structure.store', $kind, false);
        }
        foreach (['template', 'columns', 'preview', 'store'] as $step) {
            $props['import'][$step] = route("admin.structure.import.$step", absolute: false);
        }
        $props['student_count_session'] = $metrics['student_count_session'];
        $props['health'] = $metrics['health'];

        return $props;
    }
}
