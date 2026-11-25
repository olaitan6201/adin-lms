<?php

namespace App\Services\Insights;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final readonly class AssessmentRecords
{
    public function __construct(private Builder $roster, private Collection $offeringIds) {}

    public function receipts(): Collection
    {
        return (clone $this->roster)->tap(ReportLimit::apply(...))
            ->join('submission_recipients as r', 'r.enrolment_id', '=', 'e.id')
            ->join('submission_versions as v', 'v.id', '=', 'r.version_id')
            ->join('submissions as sub', 'sub.id', '=', 'v.submission_id')
            ->join('assignments as a', 'a.id', '=', 'sub.assignment_id')
            ->join('assessment_items as i', 'i.id', '=', 'a.item_id')
            ->join('gradebooks as b', 'b.id', '=', 'i.gradebook_id')
            ->whereColumn('b.offering_id', 'e.offering_id')
            ->orderByDesc('v.revision')
            ->orderBy('v.id')
            ->get(['v.id', 'e.id as learner', 'u.full_name', 'e.offering_id', 'i.title',
                'v.receipt', 'sub.id as submission', 'a.id as assignment'])
            ->unique(fn ($r) => $r->learner.':'.$r->submission);
    }

    public function scores(): Collection
    {
        $scores = (clone $this->roster)
            ->join('assessment_scores as sc', 'sc.enrolment_id', '=', 'e.id')
            ->join('assessment_items as i', 'i.id', '=', 'sc.item_id')
            ->join('gradebooks as b', 'b.id', '=', 'i.gradebook_id')
            ->whereColumn('b.offering_id', 'e.offering_id');

        return ReportRelease::score($scores)->tap(ReportLimit::apply(...))
            ->orderByDesc('sc.revision')
            ->orderBy('sc.id')
            ->get(['e.id', 'u.full_name', 'e.offering_id', 'i.title', 'i.id as item', 'sc.points', 'i.maximum_score'])
            ->unique(fn ($s) => $s->id.':'.$s->item);
    }

    public function grades(): Collection
    {
        $grades = (clone $this->roster)->join('grades as g', 'g.enrolment_id', '=', 'e.id');

        return ReportRelease::grade($grades)->tap(ReportLimit::apply(...))
            ->orderByDesc('g.revision')
            ->orderBy('g.id')
            ->get(['e.id', 'e.offering_id', 'u.full_name', 'g.grade', 'g.total_percent'])
            ->unique('id');
    }

    public function exams(): Collection
    {
        return $this->items()
            ->join('examinations as x', 'x.item_id', '=', 'i.id')
            ->orderBy('x.opens_at')
            ->get(['x.id', 'b.offering_id', 'i.title', 'i.id as item', 'x.opens_at', 'x.closes_at']);
    }

    public function attempts(): int
    {
        return (clone $this->roster)
            ->join('examination_attempts as ea', 'ea.enrolment_id', '=', 'e.id')
            ->join('examinations as x', 'x.id', '=', 'ea.exam_id')
            ->join('assessment_items as i', 'i.id', '=', 'x.item_id')
            ->join('gradebooks as b', 'b.id', '=', 'i.gradebook_id')
            ->whereColumn('b.offering_id', 'e.offering_id')
            ->count();
    }

    public function pendingMarks(Collection $receipts): int
    {
        $marked = (clone $this->roster)->tap(ReportLimit::apply(...))
            ->join('assessment_scores as sc', 'sc.enrolment_id', '=', 'e.id')
            ->whereIn('sc.submission_version_id', $receipts->pluck('id'))
            ->get(['e.id', 'sc.submission_version_id'])
            ->keyBy(fn ($s) => $s->id.':'.$s->submission_version_id);

        return $receipts->reject(fn ($r) => $marked->has($r->learner.':'.$r->id))->count();
    }

    public function openAssignments(): Collection
    {
        return $this->items()
            ->join('assignments as a', 'a.item_id', '=', 'i.id')
            ->where('a.opens_at', '<=', now())
            ->where('a.closes_at', '>', now())
            ->orderBy('a.due_at')
            ->get(['a.id', 'i.title', 'b.offering_id', 'a.due_at']);
    }

    private function items(): Builder
    {
        return DB::table('assessment_items as i')
            ->tap(ReportLimit::apply(...))
            ->join('gradebooks as b', 'b.id', '=', 'i.gradebook_id')
            ->whereIn('b.offering_id', $this->offeringIds);
    }
}
