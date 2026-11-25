<?php

namespace App\Services\Learning;

use App\Enums\EnrolmentStatus;
use App\Models\Enrolment;
use App\Models\LessonProgress;
use App\Models\Module;
use Illuminate\Support\Facades\DB;

final class LessonCompletion
{
    public function complete(?string $id, Module $lesson): void
    {
        DB::transaction(function () use ($id, $lesson): void {
            Enrolment::whereKey($id)
                ->where('status', EnrolmentStatus::Registered)
                ->lockForUpdate()
                ->firstOrFail();
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
