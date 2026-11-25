<?php

namespace App\Services\Learning;

use App\Enums\EnrolmentStatus;
use App\Models\Enrolment;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\Offering;
use App\Policies\LearningPolicy;
use Illuminate\Support\Facades\DB;

final class LessonCompletion
{
    public function __construct(private LearningPolicy $policy) {}

    public function complete(?string $id, Module $lesson): void
    {
        DB::transaction(function () use ($id, $lesson): void {
            $offering = Offering::sharedLock()->findOrFail($lesson->offering_id);
            abort_unless($this->policy->published($offering), 404);
            $registration = Enrolment::whereKey($id)
                ->where('offering_id', $lesson->offering_id)
                ->where('status', EnrolmentStatus::Registered)
                ->lockForUpdate()
                ->firstOrFail();
            $lesson = Module::sharedLock()->findOrFail($lesson->id);
            abort_unless($this->policy->released($lesson) && LessonAccess::unlocked($registration->student->user_id)
                ->where('lesson.id', $lesson->id)->exists(), 404);
            $record =
                LessonProgress::where('enrolment_id', $id)->where('module_id', $lesson->id)->first() ??
                new LessonProgress;
            if (! $record->completed_at) {
                $record
                    ->forceFill([
                        'enrolment_id' => $id,
                        'module_id' => $lesson->id,
                        'last_seen' => now(),
                        'completed_at' => now(),
                    ])
                    ->save();
            }
        });
    }
}
