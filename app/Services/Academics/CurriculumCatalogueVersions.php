<?php

namespace App\Services\Academics;

use App\Models\Curriculum;
use Illuminate\Database\Eloquent\Collection;
use LogicException;

final class CurriculumCatalogueVersions
{
    private const PATHWAY_RELATIONS = [
        'academicPathway:id,academic_programme_id,specialization_id',
        'academicPathway.programme:id,name',
        'academicPathway.specialization:id,name',
    ];

    /** @return Collection<int, Curriculum> */
    public function listing(): Collection
    {
        $query = Curriculum::query()
            ->with(['programme:id,name', ...self::PATHWAY_RELATIONS])
            ->leftJoin('programmes as legacy_programme', 'legacy_programme.id', '=', 'curricula.programme_id')
            ->leftJoin('academic_pathways as pathway', 'pathway.id', '=', 'curricula.academic_pathway_id')
            ->leftJoin('academic_programmes as shared_programme', 'shared_programme.id', '=', 'pathway.academic_programme_id')
            ->leftJoin('specializations as specialization', 'specialization.id', '=', 'pathway.specialization_id');
        $pathwayName = $query->getConnection()->getDriverName() === 'mysql'
            ? "concat(specialization.name, ' · ', shared_programme.name)"
            : "specialization.name || ' · ' || shared_programme.name";

        return $query
            ->orderByRaw("case when curricula.academic_pathway_id is null then legacy_programme.name else $pathwayName end")
            ->orderByDesc('curricula.version')
            ->orderBy('curricula.id')
            ->get([
                'curricula.id',
                'curricula.programme_id',
                'curricula.academic_pathway_id',
                'curricula.version',
                'curricula.status',
            ])
            ->each($this->ensurePathwaySources(...));
    }

    public function selection(Curriculum $version): Curriculum
    {
        $version->loadMissing(self::PATHWAY_RELATIONS);
        $this->ensurePathwaySources($version);

        return $version;
    }

    private function ensurePathwaySources(Curriculum $version): void
    {
        if ($version->academic_pathway_id === null) {
            return;
        }

        $pathway = $version->academicPathway;

        if ($pathway?->programme === null || $pathway->specialization === null) {
            throw new LogicException('A linked curriculum is missing its academic pathway sources.');
        }
    }
}
