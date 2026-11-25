<?php

namespace App\Services\Learning;

use App\Enums\EnrolmentStatus;
use App\Models\Module;
use Carbon\CarbonImmutable;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

final class LessonAccess
{
    public static function unlocked(?string $user): Builder
    {
        return DB::table('modules as lesson')->select('lesson.id')
            ->where(fn ($query) => $query->whereNull('lesson.prerequisite_id')
                ->orWhereExists(self::completions()->selectRaw('1')
                    ->where('student.user_id', $user)
                    ->whereColumn('registration.offering_id', 'lesson.offering_id')
                    ->whereColumn('progress.module_id', 'lesson.prerequisite_id')));
    }

    public static function completers(Module $lesson, ?CarbonImmutable $completedBy): Builder
    {
        return self::completions()->select('student.user_id')
            ->where('registration.offering_id', $lesson->offering_id)
            ->where('progress.module_id', $lesson->prerequisite_id)
            ->when($completedBy, fn ($query) => $query->where('progress.completed_at', '<=', $completedBy));
    }

    private static function completions(): Builder
    {
        return DB::table('lesson_progress as progress')
            ->join('enrolments as registration', 'registration.id', '=', 'progress.enrolment_id')
            ->join('students as student', 'student.id', '=', 'registration.student_id')
            ->join('modules as prior', 'prior.id', '=', 'progress.module_id')
            ->whereColumn('prior.offering_id', 'registration.offering_id')
            ->where('registration.status', EnrolmentStatus::Registered)
            ->whereNotNull('progress.completed_at');
    }
}
