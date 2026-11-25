<?php

namespace App\Services\Insights;

use App\Enums\EnrolmentStatus;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

final class StudentReleases
{
    public function latest(User $user, Builder $scope): Collection
    {
        $eligible = $scope->reorder()->join('enrolments as e', 'e.offering_id', '=', 'o.id')
            ->join('students as st', 'st.id', '=', 'e.student_id')
            ->where('st.user_id', $user->id)->where('e.status', EnrolmentStatus::Registered);
        $published = Grade::published()->selectRaw('max(revision) as revision, enrolment_id')->groupBy('enrolment_id')
            ->whereIn('enrolment_id', (clone $eligible)->select('e.id'));
        $results = (clone $eligible)->join('grades as g', 'g.enrolment_id', '=', 'e.id')
            ->joinSub($published, 'latest', fn ($j) => $j->on('latest.enrolment_id', '=', 'e.id')->on('latest.revision', '=', 'g.revision'))
            ->select('g.id', 'g.grade', 'g.revision', 'g.published_at', 'cc.title', 'o.external_offering_id')
            ->orderByDesc('g.published_at')->orderBy('g.id')->limit(6)->get()
            ->map(fn ($r) => [
                'title' => $r->title ?? $r->external_offering_id, 'context' => $r->external_offering_id,
                'detail' => "Final grade: {$r->grade} · revision {$r->revision}",
                'at' => Carbon::parse($r->published_at)->utc()->toIso8601String(),
                'download' => true, 'href' => route('assessment.sheet', $r->id, false),
            ]);
        $feedback = $eligible->join('assessment_scores as sc', 'sc.enrolment_id', '=', 'e.id')
            ->join('gradebooks as b', 'b.offering_id', '=', 'o.id')
            ->join('assessment_items as i', fn ($j) => $j->on('i.gradebook_id', '=', 'b.id')->on('i.id', '=', 'sc.item_id'))
            ->join('assignments as a', 'a.item_id', '=', 'i.id')->where('a.opens_at', '<=', now())
            ->join('submissions as sub', 'sub.assignment_id', '=', 'a.id')
            ->join('submission_versions as v', fn ($j) => $j->on('v.submission_id', '=', 'sub.id')->on('v.id', '=', 'sc.submission_version_id'))
            ->join('submission_recipients as r', fn ($j) => $j->on('r.version_id', '=', 'v.id')->on('r.enrolment_id', '=', 'e.id'))
            ->where('sc.released_at', '<=', now())
            ->whereNotExists(fn ($q) => $q->from('assessment_scores as newer')->whereColumn('newer.item_id', 'sc.item_id')
                ->whereColumn('newer.enrolment_id', 'e.id')->whereColumn('newer.revision', '>', 'sc.revision')->where('newer.released_at', '<=', now()))
            ->select('a.id', 'v.id as version', 'i.title', 'sc.released_at', 'sc.points', 'o.external_offering_id')
            ->orderByDesc('sc.released_at')->orderBy('sc.id')->limit(6)->get()
            ->map(fn ($r) => [
                'title' => $r->title, 'context' => $r->external_offering_id, 'detail' => "Returned mark: {$r->points} points",
                'at' => Carbon::parse($r->released_at)->utc()->toIso8601String(), 'download' => false,
                'href' => route('assignments.show', $r->id, false).'#submission-'.$r->version,
            ]);

        return $results->concat($feedback)->sortByDesc('at')->values();
    }
}
