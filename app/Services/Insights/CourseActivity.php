<?php

namespace App\Services\Insights;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class CourseActivity
{
    public function append(InsightTable $table, Collection $courses, string $audience, User $user): void
    {
        $ids = $courses->keys();
        foreach ($courses as $course) {
            $table->add($course->label, 'Course', $course->title ?? 'Unlinked offering', $course->status);
        }
        $table->totals['Courses'] = $courses->count();
        $published = $courses->where('status', 'published');
        if ($audience !== 'Student') {
            $table->totals['Published courses'] = $published->count();
            $table->totals['Active lecturers'] = DB::table('teaching_allocations as ta')->join('lecturers as l', 'l.id', '=', 'ta.lecturer_id')
                ->join('users as u', 'u.id', '=', 'l.user_id')->where('u.status', 'active')
                ->whereIn('ta.offering_id', $published->keys())->distinct()->count('l.id');
        }
        if (in_array($audience, ['Institution', 'Academic unit'], true)) {
            $today = now()->toDateString();
            $table->totals['Active academic sessions'] = $courses->where('starts_on', '<=', $today)
                ->where('ends_on', '>=', $today)->pluck('session_id')->filter()->unique()->count();
            $table->totals['Participating departments'] = $courses->pluck('department')->filter()->unique()->count();
            $table->totals['Offerings awaiting approval'] = $courses->where('status', 'draft')->whereNull('approved_at')->count();

            return;
        }
        $materials = DB::table('material_versions as v')->join('learning_materials as m', 'm.id', '=', 'v.material_id')
            ->join('modules as mo', 'mo.id', '=', 'm.module_id')->whereIn('mo.offering_id', $ids);
        if ($audience === 'Lecturer') {
            $table->totals['My uploaded files'] = (clone $materials)->where('v.created_by', $user->id)->whereNotNull('v.file_id')->count();
        } else {
            $materials->whereNull('m.restrictions')->where('mo.kind', 'not like', 'draft:%');
            foreach (['m', 'mo'] as $alias) {
                $materials->where(fn ($q) => $q->whereNull("$alias.opens_at")->orWhere("$alias.opens_at", '<=', now()))
                    ->where(fn ($q) => $q->whereNull("$alias.closes_at")->orWhere("$alias.closes_at", '>', now()));
            }
        }
        foreach ($materials->distinct()->orderBy('m.title')->get(['m.id', 'm.title', 'mo.offering_id', 'mo.title as lesson']) as $m) {
            $table->add($courses[$m->offering_id]->label, 'Resource', $m->title, $m->lesson);
        }
        foreach (DB::table('classes')->whereIn('offering_id', $ids)->where('status', 'scheduled')
            ->where('starts_at', '>=', now())->orderBy('starts_at')->get(['offering_id', 'title', 'starts_at']) as $class) {
            $table->add($courses[$class->offering_id]->label, 'Upcoming class', $class->title, $class->starts_at);
        }
        foreach (DB::table('announcements')->whereIn('offering_id', $ids)->where('published_at', '<=', now())
            ->orderByDesc('published_at')->get(['offering_id', 'body', 'published_at']) as $notice) {
            $table->add($courses[$notice->offering_id]->label, 'Course notice', $notice->body, $notice->published_at);
        }
    }
}
