<?php

namespace App\Services\Academics;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class AcademicCoreDecisionView
{
    public function forPathway(string $pathway): Collection
    {
        return DB::table('curriculum_adoption_decisions as decisions')
            ->join('curricula', 'curricula.id', '=', 'decisions.curriculum_id')
            ->join('academic_sessions as sessions', 'sessions.id', '=', 'decisions.academic_session_id')
            ->join('entry_cohorts as cohorts', 'cohorts.id', '=', 'decisions.entry_cohort_id')
            ->leftJoin('curriculum_adoptions as active', 'active.active_decision_id', '=', 'decisions.id')
            ->where('decisions.academic_pathway_id', $pathway)
            ->orderByDesc('decisions.recorded_at')->orderByDesc('decisions.id')
            ->get([
                'decisions.id', 'curricula.version', 'sessions.label as session', 'cohorts.label as cohort',
                'decisions.decision_reference', 'decisions.reason', 'active.id as operative_id',
            ]);
    }
}
