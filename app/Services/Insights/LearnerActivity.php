<?php

namespace App\Services\Insights;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class LearnerActivity
{
    public function append(InsightTable $table, Builder $roster, Collection $courses, ReportAudience $audience): void
    {
        $members = (clone $roster)->orderBy('e.id')->get(['e.id', 'e.offering_id', 'e.student_id', 'p.matric_number',
            'p.external_student_id', 'e.completed_at', 'u.full_name'])->keyBy('id');
        $progress = (clone $roster)->join('lesson_progress as lp', 'lp.enrolment_id', '=', 'e.id')
            ->join('modules as m', 'm.id', '=', 'lp.module_id')->whereColumn('m.offering_id', 'e.offering_id')
            ->when($audience === ReportAudience::Student, ReportRelease::lesson(...))
            ->orderBy('lp.last_seen', 'desc')->get(['e.id', 'm.title', 'lp.completed_at', 'lp.last_seen']);
        $attendance = (clone $roster)->join('attendance as a', 'a.user_id', '=', 'p.user_id')
            ->join('classes as cl', 'cl.id', '=', 'a.class_id')->whereColumn('cl.offering_id', 'e.offering_id')
            ->orderBy('cl.starts_at')->get(['e.id', 'cl.title', 'a.status']);
        $table->totals += [
            'Registered students' => $members->pluck('student_id')->unique()->count(),
            'Registrations' => $members->count(),
            'Completed registrations' => $members->whereNotNull('completed_at')->count(),
            'Engaged registrations' => $progress->pluck('id')->unique()->count(),
            'Lessons visited' => $progress->count(),
            'Completed lessons' => $progress->whereNotNull('completed_at')->count(),
            'Attendance records' => $attendance->count(),
        ];
        if ($audience->isAggregate()) {
            foreach ($members->groupBy(fn ($m) => $courses[$m->offering_id]->department ?? 'Unassigned') as $dept => $group) {
                $table->add('Academic unit', 'Department registrations', $dept, $group->count());
            }
            if ($recent = $progress->first()) {
                $table->add('Activity', 'Latest lesson visit', $recent->title, $recent->last_seen);
            }

            return;
        }
        $modules = DB::table('modules as m')->whereIn('offering_id', $courses->keys())
            ->when($audience === ReportAudience::Student, ReportRelease::lesson(...))
            ->groupBy('offering_id')->selectRaw('offering_id, count(*) as total')->pluck('total', 'offering_id');
        $completed = $progress->whereNotNull('completed_at')->countBy('id');
        foreach ($members as $member) {
            $table->add($courses[$member->offering_id]->label, 'Roster', $member->full_name ?? $member->external_student_id,
                ($member->matric_number ?? $member->external_student_id).' · '.($member->completed_at ? 'Completed' : 'Registered'));
            $table->add($courses[$member->offering_id]->label, 'Lesson progress', $member->full_name ?? $member->external_student_id,
                $completed->get($member->id, 0).' / '.$modules->get($member->offering_id, 0).' lessons');
        }
        foreach ($progress as $lesson) {
            $member = $members[$lesson->id];
            $table->add($courses[$member->offering_id]->label, 'Lesson', $lesson->title,
                ($member->full_name ?? $member->external_student_id).' · '.($lesson->completed_at ? 'Completed' : 'In progress'));
        }
        foreach ($attendance as $entry) {
            $member = $members[$entry->id];
            $table->add($courses[$member->offering_id]->label, 'Attendance', $entry->title,
                ($member->full_name ?? $member->external_student_id).' · '.$entry->status);
        }
    }
}
