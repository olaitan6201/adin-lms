<?php

namespace App\Services\Insights;

use App\Enums\Learning\ClassStatus;
use App\Enums\OfferingStatus;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class CourseActivity
{
    public function append(InsightTable $table, Collection $courses, ReportAudience $audience, User $user): void
    {
        $ids = $courses->keys();
        foreach ($courses as $course) {
            $table->add($course->label, 'Course', $course->title ?? 'Unlinked offering', $course->status);
        }

        $table->totals['Courses'] = $courses->count();
        $published = $courses->where('status', OfferingStatus::Published->value);
        if ($audience !== ReportAudience::Student) {
            $table->totals['Published courses'] = $published->count();
            $table->totals['Active lecturers'] = DB::table('teaching_allocations as ta')->join('lecturers as l', 'l.id', '=', 'ta.lecturer_id')
                ->join('users as u', 'u.id', '=', 'l.user_id')->where('u.status', 'active')
                ->whereIn('ta.offering_id', $published->keys())->distinct()->count('l.id');
        }

        if ($audience->isAggregate()) {
            $today = now()->toDateString();
            $table->totals['Active academic sessions'] = $courses->where('starts_on', '<=', $today)
                ->where('ends_on', '>=', $today)->pluck('session_id')->filter()->unique()->count();
            $table->totals['Participating departments'] = $courses->pluck('department')->filter()->unique()->count();
            $table->totals['Offerings awaiting approval'] = $courses->where('status', OfferingStatus::Draft->value)->whereNull('approved_at')->count();

            return;
        }

        $materials = DB::table('material_versions as v')
            ->join('learning_materials as resource', 'resource.id', '=', 'v.material_id')
            ->join('modules as m', 'm.id', '=', 'resource.module_id')
            ->whereIn('m.offering_id', $ids);
        if ($audience === ReportAudience::Lecturer) {
            $table->totals['My uploaded files'] = (clone $materials)->where('v.created_by', $user->id)->whereNotNull('v.file_id')->count();
        } else {
            ReportRelease::material($materials);
        }

        foreach ($materials->tap(ReportLimit::apply(...))->distinct()->orderBy('resource.title')->get(['resource.id', 'resource.title', 'm.offering_id', 'm.title as lesson']) as $m) {
            $table->add($courses[$m->offering_id]->label, 'Resource', $m->title, $m->lesson);
        }

        foreach (DB::table('classes')->tap(ReportLimit::apply(...))->whereIn('offering_id', $ids)->where('status', ClassStatus::Scheduled)
            ->where('starts_at', '>=', now())->orderBy('starts_at')->get(['offering_id', 'title', 'starts_at']) as $class) {
            $table->add($courses[$class->offering_id]->label, 'Upcoming class', $class->title, $class->starts_at);
        }

        foreach (DB::table('announcements')->tap(ReportLimit::apply(...))->whereIn('offering_id', $ids)->where('published_at', '<=', now())
            ->orderByDesc('published_at')->get(['offering_id', 'body', 'published_at']) as $notice) {
            $table->add($courses[$notice->offering_id]->label, 'Course notice', $notice->body, $notice->published_at);
        }
    }
}
