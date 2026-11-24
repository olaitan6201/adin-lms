<?php

namespace App\Services\Insights;

use Brick\Math\BigDecimal;
use Brick\Math\RoundingMode;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class AssessmentActivity
{
    public function append(InsightTable $table, Builder $roster, Collection $courses, string $audience): void
    {
        $personal = $audience === 'Student';
        $detail = $personal || $audience === 'Lecturer';
        $items = DB::table('assessment_items as i')->join('gradebooks as b', 'b.id', '=', 'i.gradebook_id')
            ->whereIn('b.offering_id', $courses->keys());
        $receipts = (clone $roster)->join('submission_recipients as r', 'r.enrolment_id', '=', 'e.id')
            ->join('submission_versions as v', 'v.id', '=', 'r.version_id')->join('submissions as sub', 'sub.id', '=', 'v.submission_id')
            ->join('assignments as a', 'a.id', '=', 'sub.assignment_id')->join('assessment_items as i', 'i.id', '=', 'a.item_id')
            ->join('gradebooks as b', 'b.id', '=', 'i.gradebook_id')->whereColumn('b.offering_id', 'e.offering_id')
            ->orderByDesc('v.revision')->orderBy('v.id')->get(['v.id', 'e.id as learner', 'u.full_name', 'e.offering_id', 'i.title',
                'v.receipt', 'sub.id as submission', 'a.id as assignment'])
            ->unique(fn ($r) => $r->learner.':'.$r->submission);
        $scores = (clone $roster)->join('assessment_scores as sc', 'sc.enrolment_id', '=', 'e.id')
            ->join('assessment_items as i', 'i.id', '=', 'sc.item_id')->join('gradebooks as b', 'b.id', '=', 'i.gradebook_id')
            ->whereColumn('b.offering_id', 'e.offering_id')->where('sc.released_at', '<=', now())
            ->orderByDesc('sc.revision')->orderBy('sc.id')->get(['e.id', 'u.full_name', 'e.offering_id', 'i.title', 'i.id as item',
                'sc.points', 'i.maximum_score', 'sc.submission_version_id'])
            ->unique(fn ($s) => $s->id.':'.$s->item);
        $grades = (clone $roster)->join('grades as g', 'g.enrolment_id', '=', 'e.id')->whereNotNull('g.approved_at')
            ->whereNotNull('g.approved_by')->where('g.moderation_status', 'approved')
            ->where('g.published_at', '<=', now())->orderByDesc('g.revision')->orderBy('g.id')
            ->get(['e.id', 'e.offering_id', 'u.full_name', 'g.grade', 'g.total_percent'])->unique('id');
        $exams = (clone $items)->join('examinations as x', 'x.item_id', '=', 'i.id')->orderBy('x.opens_at')
            ->get(['x.id', 'b.offering_id', 'i.title', 'i.id as item', 'x.opens_at', 'x.closes_at']);
        $attempts = (clone $roster)->join('examination_attempts as ea', 'ea.enrolment_id', '=', 'e.id')
            ->join('examinations as x', 'x.id', '=', 'ea.exam_id')->join('assessment_items as i', 'i.id', '=', 'x.item_id')
            ->join('gradebooks as b', 'b.id', '=', 'i.gradebook_id')->whereColumn('b.offering_id', 'e.offering_id')->count();
        $table->totals += ['Submissions' => $receipts->pluck('submission')->unique()->count(), 'Exam attempts' => $attempts,
            'Published results' => $grades->count(), 'Exams' => $exams->count()];
        $examItems = $exams->pluck('item')->flip();
        foreach ($scores->filter(fn ($s) => $examItems->has($s->item))->groupBy('item') as $group) {
            $s = $group->first();
            $sum = $group->reduce(fn (BigDecimal $sum, $row) => $sum->plus((string) $row->points), BigDecimal::zero());
            $table->add($courses[$s->offering_id]->label, 'Exam performance', $s->title,
                $sum->dividedBy($group->count(), 2, RoundingMode::HalfUp).' mean points / '.$s->maximum_score);
        }
        if (! $detail) {
            return;
        }
        if (! $personal) {
            $marked = (clone $roster)->join('assessment_scores as sc', 'sc.enrolment_id', '=', 'e.id')
                ->whereIn('sc.submission_version_id', $receipts->pluck('id'))->get(['e.id', 'sc.submission_version_id'])
                ->keyBy(fn ($s) => $s->id.':'.$s->submission_version_id);
            $table->totals['Pending marking (recipients)'] = $receipts->reject(fn ($r) => $marked->has($r->learner.':'.$r->id))->count();
        }
        foreach ($receipts as $r) {
            $table->add($courses[$r->offering_id]->label, 'Submission', $r->title, trim($r->full_name.' · '.$r->receipt));
        }
        foreach ($scores as $s) {
            $table->add($courses[$s->offering_id]->label, 'Score', $s->title, trim($s->full_name.' · '.$s->points.' / '.$s->maximum_score));
        }
        foreach ($grades as $g) {
            $table->add($courses[$g->offering_id]->label, 'Published result', $g->full_name ?? 'Learner', $g->total_percent.'% · '.$g->grade);
        }
        foreach ($exams->where('closes_at', '>', now()->toDateTimeString()) as $exam) {
            $table->add($courses[$exam->offering_id]->label, 'Exam window', $exam->title, $exam->opens_at.' – '.$exam->closes_at);
        }
        $assignments = (clone $items)->join('assignments as a', 'a.item_id', '=', 'i.id')
            ->where('a.opens_at', '<=', now())->where('a.closes_at', '>', now())->orderBy('a.due_at')
            ->get(['a.id', 'i.title', 'b.offering_id', 'a.due_at']);
        $submitted = $receipts->pluck('assignment')->flip();
        foreach ($assignments as $a) {
            if (! $personal || ! $submitted->has($a->id)) {
                $table->add($courses[$a->offering_id]->label, $personal ? 'Outstanding assignment' : 'Open assignment', $a->title, $a->due_at);
            }
        }
    }
}
