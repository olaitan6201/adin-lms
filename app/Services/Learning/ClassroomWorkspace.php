<?php

namespace App\Services\Learning;

use App\Enums\EnrolmentStatus;
use App\Enums\Learning\AttendanceStatus;
use App\Enums\Learning\ClassStatus;
use App\Models\Attendance;
use App\Models\ClassSession;
use App\Models\Enrolment;
use App\Models\LearningMaterial;
use App\Models\Offering;
use App\Models\TeachingAllocation;
use App\Models\User;
use App\Policies\LearningPolicy;
use Illuminate\Support\Collection;

final class ClassroomWorkspace
{
    public function __construct(private LearningPolicy $policy, private ClassRegister $register) {}

    public function props(Offering $offering, User $user, bool $staff): array
    {
        $materials = LearningMaterial::with('module')
            ->when(! $staff, fn ($q) => $q->whereIn('module_id', LessonAccess::unlocked($user->id)))
            ->whereHas('module', fn ($q) => $q->where('offering_id', $offering->id))
            ->get()
            ->filter(
                fn ($m) => $staff || ($this->policy->released($m) && $this->policy->released($m->module)),
            )
            ->keyBy('id');
        $sessions = ClassSession::withCasts(['mark' => AttendanceStatus::class])
            ->where('offering_id', $offering->id)
            ->addSelect([
                'mark' => Attendance::select('status')
                    ->whereColumn('class_id', 'classes.id')
                    ->where('user_id', $user->id),
            ])
            ->orderBy('starts_at')
            ->get();

        return [
            'base' => route('learning.index', $offering),
            'title' => $offering->curriculumCourse?->title ?? $offering->external_offering_id,
            'overview' => route('courses.show', $offering),
            'board' => route('community.board', $offering),
            'staff' => $staff,
            'classStatuses' => array_column(ClassStatus::cases(), 'value'),
            'attendanceStatuses' => array_column(AttendanceStatus::cases(), 'value'),
            'percentage' => $this->register->percentage($sessions),
            'participants' => $staff ? $this->participants($offering) : [],
            'materials' => $staff ? $materials->values()->map->only(['id', 'title']) : [],
            'sessions' => $sessions->map(
                fn ($s) => [
                    ...$s->only(['id', 'title', 'starts_at', 'ends_at']),
                    'accepts_marks' => $s->status !== ClassStatus::Cancelled,
                    'status' => $s->status->value,
                    'mark' => $s->mark?->value,
                    'meeting_url' => $staff || $s->status !== ClassStatus::Cancelled ? $s->meeting_url : null,
                    'recording_material_id' => $materials->has($s->recording_material_id)
                        ? $s->recording_material_id
                        : null,
                ],
            ),
        ];
    }

    private function participants(Offering $offering): Collection
    {
        $students = Enrolment::join('students', 'students.id', '=', 'enrolments.student_id')
            ->where('offering_id', $offering->id)
            ->where('enrolments.status', EnrolmentStatus::Registered)
            ->select('students.user_id');
        $staff = TeachingAllocation::join(
            'lecturers',
            'lecturers.id',
            '=',
            'teaching_allocations.lecturer_id',
        )
            ->where('offering_id', $offering->id)
            ->select('lecturers.user_id');

        return User::whereIn('id', $students->union($staff))
            ->orderBy('full_name')
            ->get(['id', 'full_name']);
    }
}
