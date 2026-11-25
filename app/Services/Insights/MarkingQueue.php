<?php

namespace App\Services\Insights;

use App\Enums\Assessment\AttemptState;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

final class MarkingQueue
{
    public function forScope(Builder $scope): Collection
    {
        $items = $scope->reorder()->join('gradebooks as b', 'b.offering_id', '=', 'o.id')
            ->join('assessment_items as i', 'i.gradebook_id', '=', 'b.id');
        $assignments = (clone $items)->join('assignments as a', 'a.item_id', '=', 'i.id')
            ->join('submissions as sub', 'sub.assignment_id', '=', 'a.id')
            ->join('submission_versions as v', 'v.submission_id', '=', 'sub.id')
            ->whereNotExists(fn ($q) => $q->from('submission_versions as later')
                ->whereColumn('later.submission_id', 'sub.id')->whereColumn('later.revision', '>', 'v.revision'))
            ->whereNotExists(fn ($q) => $q->from('assessment_scores as sc')->whereColumn('sc.submission_version_id', 'v.id'))
            ->select('a.id', 'i.title', 'o.external_offering_id', 'v.submitted_at', 'v.revision', 'v.id as version')
            ->orderBy('v.submitted_at')->orderBy('v.id')->limit(12)->get()
            ->map(fn ($r) => [
                'title' => $r->title, 'kind' => "Submission · revision {$r->revision}", 'context' => $r->external_offering_id,
                'at' => Carbon::parse($r->submitted_at)->toIso8601String(), 'action' => 'Mark submission',
                'href' => route('assignments.show', $r->id, false).'#submission-'.$r->version,
            ]);
        $exams = $items->join('examinations as ex', 'ex.item_id', '=', 'i.id')
            ->join('examination_attempts as a', 'a.exam_id', '=', 'ex.id')
            ->where('a.state', AttemptState::AwaitingReview)->whereNotNull('a.submitted_at')
            ->select('a.id', 'i.title', 'o.external_offering_id', 'a.submitted_at')
            ->orderBy('a.submitted_at')->orderBy('a.id')->limit(12)->get()
            ->map(fn ($r) => [
                'title' => $r->title, 'kind' => 'Exam script', 'context' => $r->external_offering_id,
                'at' => Carbon::parse($r->submitted_at)->toIso8601String(), 'action' => 'Review script',
                'href' => route('assessment.script', $r->id, false),
            ]);

        return DashboardWorkspace::chronological($assignments->concat($exams));
    }
}
