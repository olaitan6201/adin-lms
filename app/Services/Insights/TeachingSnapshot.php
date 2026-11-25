<?php

namespace App\Services\Insights;

use App\Enums\EnrolmentStatus;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

final class TeachingSnapshot
{
    public function forUser(User $user, Builder $scope): array
    {
        $scope->reorder();
        $roster = (clone $scope)->join('enrolments as e', 'e.offering_id', '=', 'o.id')->where('e.status', EnrolmentStatus::Registered);
        $materials = (clone $scope)->join('modules as m', 'm.offering_id', '=', 'o.id')
            ->join('learning_materials as resource', 'resource.module_id', '=', 'm.id')
            ->join('material_versions as v', 'v.material_id', '=', 'resource.id')->where('v.created_by', $user->id)->whereNotNull('v.file_id');
        $items = $scope->join('gradebooks as b', 'b.offering_id', '=', 'o.id')->join('assessment_items as i', 'i.gradebook_id', '=', 'b.id');
        $assignments = (clone $items)->join('assignments as a', 'a.item_id', '=', 'i.id');
        $open = (clone $assignments)->where('a.opens_at', '<=', now())->where('a.closes_at', '>', now());

        return [
            'summary' => [
                'Enrolled students' => (clone $roster)->distinct()->count('e.student_id'),
                'My uploaded file revisions' => $materials->count(),
                'Open assignments' => $open->count(),
            ],
            'mean' => $this->publishedMean(clone $roster),
            'members' => $this->members($roster),
            'uploads' => $this->uploads($materials),
            'assignments' => $this->openAssignments($open),
            'exams' => $this->upcomingExams($items),
            'submissions' => $this->submissions($assignments),
        ];
    }

    private function publishedMean(Builder $roster): ?string
    {
        $published = Grade::published()->whereIn('enrolment_id', $roster->select('e.id'))
            ->selectRaw('enrolment_id, max(revision) as revision')->groupBy('enrolment_id');
        $mean = Grade::joinSub($published, 'latest', fn ($j) => $j->on('latest.enrolment_id', '=', 'grades.enrolment_id')
            ->on('latest.revision', '=', 'grades.revision'))->avg('total_percent');

        return $mean === null ? null : number_format($mean, 2, '.', '');
    }

    private function members(Builder $roster): Collection
    {
        return $roster->join('students as st', 'st.id', '=', 'e.student_id')->leftJoin('users as u', 'u.id', '=', 'st.user_id')
            ->orderBy('u.full_name')->orderBy('e.id')->limit(5)->select('u.full_name', 'st.external_student_id', 'o.id', 'o.external_offering_id')->get()
            ->map(fn ($r) => [
                'title' => $r->full_name ?? $r->external_student_id, 'context' => $r->external_offering_id,
                'href' => route('insights.reports', ['offering' => $r->id], false),
            ]);
    }

    private function uploads(Builder $materials): Collection
    {
        return $materials->select('resource.title', 'm.id as lesson', 'o.id', 'o.external_offering_id', 'v.revision', 'v.created_at')
            ->orderByDesc('v.created_at')->orderBy('v.id')->limit(5)->get()->map(fn ($r) => [
                'title' => $r->title, 'context' => "$r->external_offering_id · Revision $r->revision",
                'href' => route('learning.index', $r->id, false).'#lesson-'.$r->lesson, 'at' => Carbon::parse($r->created_at)->toIso8601String(),
            ]);
    }

    private function openAssignments(Builder $open): Collection
    {
        return $open->select('i.title', 'a.id', 'o.external_offering_id', 'a.due_at')->orderBy('a.due_at')->orderBy('a.id')->limit(5)->get()
            ->map(fn ($r) => [
                'title' => $r->title, 'context' => $r->external_offering_id, 'href' => route('assignments.show', $r->id, false),
                'at' => Carbon::parse($r->due_at)->toIso8601String(),
            ]);
    }

    private function submissions(Builder $assignments): Collection
    {
        return $assignments->join('submissions as sub', 'sub.assignment_id', '=', 'a.id')->join('submission_versions as v', 'v.submission_id', '=', 'sub.id')
            ->orderByDesc('v.submitted_at')->orderBy('v.id')->limit(5)->select('i.title', 'a.id', 'o.external_offering_id', 'v.revision', 'v.submitted_at')->get()
            ->map(fn ($r) => [
                'title' => $r->title, 'context' => "$r->external_offering_id · Revision $r->revision", 'href' => route('assignments.show', $r->id, false),
                'at' => Carbon::parse($r->submitted_at)->toIso8601String(),
            ]);
    }

    private function upcomingExams(Builder $items): Collection
    {
        return $items->join('examinations as ex', 'ex.item_id', '=', 'i.id')->where('ex.opens_at', '>', now())
            ->orderBy('ex.opens_at')->orderBy('ex.id')->limit(5)->select('i.title', 'o.external_offering_id', 'o.id', 'i.id as item', 'ex.opens_at')->get()
            ->map(fn ($r) => [
                'title' => $r->title, 'context' => $r->external_offering_id, 'href' => route('assessment.desk', $r->id, false).'#item-'.$r->item,
                'at' => Carbon::parse($r->opens_at)->toIso8601String(),
            ]);
    }
}
