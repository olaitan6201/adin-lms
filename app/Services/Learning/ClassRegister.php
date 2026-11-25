<?php

namespace App\Services\Learning;

use App\Enums\Learning\AttendanceMethod;
use App\Enums\Learning\AttendanceStatus;
use App\Enums\Learning\ClassStatus;
use App\Enums\Learning\LearningEvent;
use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\ClassSession;
use App\Models\Offering;
use App\Models\User;
use App\Policies\LearningPolicy;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class ClassRegister
{
    public function __construct(private LearningPolicy $policy) {}

    public function record(
        Offering $offering,
        ClassSession $session,
        ?User $recorder,
        string $person,
        AttendanceStatus $status,
        AttendanceMethod $method,
        ?string $reason,
    ): void {
        abort_unless($session->offering_id === $offering->id, 404);
        DB::transaction(function () use (
            $session,
            $person,
            $status,
            $method,
            $recorder,
            $reason,
            $offering,
        ): void {
            $locked = ClassSession::whereKey($session->id)->lockForUpdate()->firstOrFail();
            abort_if($locked->status === ClassStatus::Cancelled, 409);
            if (
                ! $this->policy->enrolment($person, $offering) &&
                ! $this->policy->allocated($person, $offering)
            ) {
                throw ValidationException::withMessages([
                    'user_id' => 'Select a participant registered or allocated to this offering.',
                ]);
            }

            $mark =
                Attendance::where('class_id', $session->id)->where('user_id', $person)->first() ??
                new Attendance;
            $old = $mark->status;
            if ($old === $status || ($mark->exists && $method === AttendanceMethod::Provider)) {
                return;
            }

            if ($mark->exists && blank($reason)) {
                throw ValidationException::withMessages([
                    'reason' => 'Explain the attendance correction.',
                ]);
            }

            $mark
                ->forceFill([
                    'class_id' => $session->id,
                    'user_id' => $person,
                    'status' => $status,
                    'method' => $method,
                    'recorded_by' => $recorder?->id,
                    'recorded_at' => now(),
                ])
                ->save();
            new AuditLog()
                ->forceFill([
                    'subject_key' => 'attendance:'.$mark->id,
                    'action' => LearningEvent::AttendanceRecorded->value,
                    'actor_id' => $recorder?->id,
                    'occurred_at' => now(),
                    'details' => [
                        'before' => $old?->value,
                        'after' => $status->value,
                        'reason' => $reason,
                        'method' => $method->value,
                    ],
                ])
                ->save();
        });
    }

    public function percentage(iterable $sessions): ?float
    {
        $present = 0;
        $absent = 0;
        foreach ($sessions as $session) {
            if ($session->status !== ClassStatus::Held) {
                continue;
            }

            $present += (int) ($session->mark === AttendanceStatus::Present);
            $absent += (int) ($session->mark === AttendanceStatus::Absent);
        }

        return $present + $absent ? round((100 * $present) / ($present + $absent), 2) : null;
    }
}
