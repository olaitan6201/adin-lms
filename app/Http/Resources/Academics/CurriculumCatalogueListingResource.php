<?php

namespace App\Http\Resources\Academics;

use App\Models\Curriculum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

final class CurriculumCatalogueListingResource extends ResourceCollection
{
    /** @return list<array{id: string, name: string|null, version: int, status: string}> */
    public function toArray(Request $request): array
    {
        return $this->collection
            ->map($this->version(...))
            ->values()
            ->all();
    }

    /** @return array{id: string, name: string|null, version: int, status: string} */
    private function version(Curriculum $version): array
    {
        $pathway = $version->academicPathway;

        return [
            'id' => $version->id,
            'name' => $pathway === null
                ? $version->programme?->name
                : $pathway->specialization->name.' · '.$pathway->programme->name,
            'version' => $version->version,
            'status' => $version->status->value,
        ];
    }
}
