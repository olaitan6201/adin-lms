<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class QualityEvidenceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $catalogue = $this->resource;
        $evidence = $catalogue['evidence']
            ->map(fn (object $row): array => $this->version($row) + [
                'outcomes' => (int) $row->outcomes,
                'mapped' => (int) $row->mapped,
            ])
            ->all();
        $queue = $catalogue['queue']
            ->map($this->version(...))
            ->all();

        return [
            'catalogueHref' => $catalogue['catalogueHref'],
            'approvedCount' => $catalogue['approvedCount'],
            'reviewedCount' => $catalogue['reviewedCount'],
            'evidence' => $evidence,
            'queue' => $queue,
        ];
    }

    private function version(object $row): array
    {
        return [
            'programme' => $row->programme,
            'version' => (int) $row->version,
            'framework' => $row->framework_revision,
            'href' => route('academics.curriculum.show', $row->id, false),
        ];
    }
}
