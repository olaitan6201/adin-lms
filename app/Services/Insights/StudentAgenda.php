<?php

namespace App\Services\Insights;

use App\Enums\Assessment\AttemptState;
use App\Enums\EnrolmentStatus;
use App\Enums\Learning\ClassStatus;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

final class StudentAgenda
{
    public function forUser(User $user, Builder $scope): Collection
    {
        $assignments = (clone $scope)->reorder()
            ->join('gradebooks as b', 'b.offering_id', '=', 'o.id')
            ->join('assessment_items as i', 'i.gradebook_id', '=', 'b.id')
            ->join('assignments as a', 'a.item_id', '=', 'i.id')
            ->where('a.opens_at', '<=', now())->where('a.closes_at', '>', now())
            ->where(fn ($q) => $q->where('a.due_at', '>=', now())->orWhere('a.late_policy->allow', true))
            ->whereNotExists(fn ($q) => $q->from('submissions as sub')
                ->join('submission_versions as v', 'v.submission_id', '=', 'sub.id')
                ->join('submission_recipients as r', 'r.version_id', '=', 'v.id')
                ->join('enrolments as e', 'e.id', '=', 'r.enrolment_id')
                ->join('students as st', 'st.id', '=', 'e.student_id')
                ->where('st.user_id', $user->id)->whereColumn('sub.assignment_id', 'a.id'))
            ->select('a.id', 'i.title', 'a.due_at', 'o.external_offering_id')
            ->orderBy('a.due_at')->orderBy('a.id')->limit(12)->get()
            ->map(fn ($r) => [
                'title' => $r->title, 'context' => $r->external_offering_id,
                'kind' => Carbon::parse($r->due_at)->isPast() ? 'Past due · still open' : 'Assignment due',
                'at' => Carbon::parse($r->due_at)->toIso8601String(), 'action' => 'View assignment',
                'href' => route('assignments.show', $r->id, false),
            ]);
        $activePapers = (clone $scope)->reorder()->join('enrolments as e', 'e.offering_id', '=', 'o.id')
            ->join('students as st', 'st.id', '=', 'e.student_id')->where('st.user_id', $user->id)
            ->where('e.status', EnrolmentStatus::Registered)
            ->join('examination_attempts as p', 'p.enrolment_id', '=', 'e.id')
            ->join('examinations as ex', 'ex.id', '=', 'p.exam_id')
            ->join('assessment_items as i', 'i.id', '=', 'ex.item_id')
            ->join('gradebooks as b', 'b.id', '=', 'i.gradebook_id')->whereColumn('b.offering_id', 'o.id')
            ->where('p.state', AttemptState::Active)->whereNull('p.submitted_at')->where('p.expires_at', '>', now())
            ->select('p.id', 'i.title', 'p.expires_at', 'o.external_offering_id')
            ->orderBy('p.expires_at')->orderBy('p.id')->limit(12)->get()
            ->map(fn ($r) => [
                'title' => $r->title, 'context' => $r->external_offering_id, 'kind' => 'Exam in progress',
                'at' => Carbon::parse($r->expires_at)->toIso8601String(), 'action' => 'Resume exam',
                'href' => route('assessment.paper', $r->id, false),
            ]);
        $classes = $scope->reorder()->join('classes as cl', 'cl.offering_id', '=', 'o.id')
            ->where('cl.status', ClassStatus::Scheduled)->where('cl.ends_at', '>', now())
            ->select('cl.title', 'cl.starts_at', 'o.external_offering_id', 'o.id')
            ->orderBy('cl.starts_at')->orderBy('cl.id')->limit(12)->get()
            ->map(fn ($r) => [
                'title' => $r->title, 'context' => $r->external_offering_id, 'kind' => 'Scheduled class',
                'at' => Carbon::parse($r->starts_at)->toIso8601String(), 'action' => 'Open classroom',
                'href' => route('learning.classes', $r->id, false),
            ]);

        return DashboardWorkspace::chronological($assignments->concat($classes)->concat($activePapers));
    }
}
