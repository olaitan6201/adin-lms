<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use Illuminate\Support\Facades\DB;

final class QualityEvidence
{
    public function catalogue(): array
    {
        $versions = DB::table('curricula as c')
            ->join('programmes as p', 'p.id', '=', 'c.programme_id')
            ->orderBy('p.name')->orderBy('p.id')->orderByDesc('c.version')
            ->select(['c.id', 'p.name as programme', 'c.version', 'c.framework_revision']);
        $approved = (clone $versions)->where('c.status', CurriculumStatus::Approved);
        $reviewed = (clone $versions)->where('c.status', CurriculumStatus::Reviewed);
        $outcomes = DB::table('programme_outcomes as po')->whereColumn('po.curriculum_id', 'c.id');
        $mapped = (clone $outcomes)->whereExists(fn ($query) => $query->from('outcome_mappings as m')
            ->join('course_outcomes as co', 'co.id', '=', 'm.course_outcome_id')
            ->join('curriculum_courses as cc', 'cc.id', '=', 'co.curriculum_course_id')
            ->whereColumn('m.programme_outcome_id', 'po.id')->whereColumn('cc.curriculum_id', 'c.id'));
        $evidence = (clone $approved)
            ->selectSub($outcomes->selectRaw('count(*)'), 'outcomes')
            ->selectSub($mapped->selectRaw('count(*)'), 'mapped')
            ->limit(12)->get();

        return [
            'catalogueHref' => route('academics.curriculum.show', [], false),
            'approvedCount' => $approved->count(),
            'reviewedCount' => $reviewed->count(),
            'evidence' => $evidence->map(fn ($row) => $this->version($row) + [
                'outcomes' => (int) $row->outcomes,
                'mapped' => (int) $row->mapped,
            ]),
            'queue' => $reviewed->limit(12)->get()->map($this->version(...)),
        ];
    }

    /** @return array{programme: string, version: int, framework: ?string, href: string} */
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
