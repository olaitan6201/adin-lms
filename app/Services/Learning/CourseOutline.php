<?php

namespace App\Services\Learning;

use App\Enums\Learning\LessonKind;
use App\Models\ClassSession;
use App\Models\CourseOutcome;
use App\Models\Forum;
use App\Models\GroupMember;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\Offering;
use App\Models\User;
use App\Policies\LearningPolicy;
use Illuminate\Support\Facades\DB;

final class CourseOutline
{
    public function __construct(private LearningPolicy $policy, private CourseAssessments $assessments) {}

    public function build(Offering $offering, User $user, bool $staff): array
    {
        $visible = $staff || $this->policy->published($offering);
        $enrolment = $this->policy->enrolment($user->id, $offering);
        $completed = $enrolment ? LessonProgress::where('enrolment_id', $enrolment->id)
            ->whereNotNull('completed_at')->pluck('module_id')->flip() : collect();
        $modules = $visible ? Module::where('offering_id', $offering->id)->orderBy('position')
            ->get(['id', 'kind', 'title', 'opens_at', 'closes_at'])
            ->filter(fn ($module) => $staff || $this->policy->released($module))->values() : collect();
        $activities = $modules->map(fn ($module) => [
            'id' => $module->id,
            'type' => 'Lesson',
            'title' => $module->title,
            'detail' => str_starts_with($module->kind, LessonKind::DRAFT_PREFIX) ? 'Draft'
                : ($this->policy->released($module) ? 'Available' : 'Outside release window'),
            'complete' => $completed->has($module->id),
            'href' => route('learning.index', $offering).'#lesson-'.$module->id,
        ]);
        if ($visible) {
            $classes = ClassSession::where('offering_id', $offering->id)->orderBy('starts_at')->get();
            foreach ($classes as $class) {
                $activities->push([
                    'id' => $class->id,
                    'type' => 'Class',
                    'title' => $class->title,
                    'detail' => ucfirst($class->status->value),
                    'at' => $class->starts_at,
                    'href' => route('learning.classes', $offering).'#class-'.$class->id,
                ]);
            }

            $forums = Forum::where('offering_id', $offering->id)
                ->when(! $staff, fn ($q) => $q->where(fn ($q) => $q->whereNull('group_id')
                    ->orWhereIn('group_id', GroupMember::where('enrolment_id', $enrolment?->id)->select('group_id'))))
                ->orderBy('title')->orderBy('id')->get(['id', 'title']);
            foreach ($forums as $forum) {
                $activities->push([
                    'id' => $forum->id,
                    'type' => 'Discussion',
                    'title' => $forum->title,
                    'detail' => 'Course board',
                    'href' => route('community.discussion', $forum),
                ]);
            }

            $activities = $activities->concat($this->assessments->rows($offering, $staff, $enrolment));
        }

        return [
            'modules' => $modules->map->only(['id', 'title']),
            'activities' => $activities->values(),
            'outcomes' => $visible ? CourseOutcome::where('curriculum_course_id', $offering->curriculum_course_id)
                ->orderBy('id')->pluck('statement') : [],
            'lecturers' => DB::table('teaching_allocations')
                ->join('lecturers', 'lecturers.id', '=', 'teaching_allocations.lecturer_id')
                ->join('users', 'users.id', '=', 'lecturers.user_id')
                ->where('offering_id', $offering->id)->orderBy('full_name')->pluck('full_name'),
        ];
    }
}
