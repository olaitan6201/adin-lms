<?php

namespace App\Http\Resources\Academics;

use App\Models\Curriculum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Curriculum */
final class CurriculumCatalogueSelectionResource extends JsonResource
{
    /**
     * @return array{
     *     id: string, programme_id: string|null, version: int, status: string,
     *     framework_revision: string|null, approved_by: string|null, approved_at: string|null,
     *     academic_pathway_id: string|null, academic_programme_id: string|null,
     *     pathway: array{programme: string, specialization: string}|null
     * }
     */
    public function toArray(Request $request): array
    {
        $pathway = $this->academicPathway;

        return [
            'id' => $this->id,
            'programme_id' => $this->programme_id,
            'version' => $this->version,
            'status' => $this->status->value,
            'framework_revision' => $this->framework_revision,
            'approved_by' => $this->approved_by,
            'approved_at' => $this->approved_at?->toJSON(),
            'academic_pathway_id' => $this->academic_pathway_id,
            'academic_programme_id' => $this->academic_programme_id,
            'pathway' => $pathway === null ? null : [
                'programme' => $pathway->programme->name,
                'specialization' => $pathway->specialization->name,
            ],
        ];
    }
}
