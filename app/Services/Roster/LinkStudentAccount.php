<?php

namespace App\Services\Roster;

use App\Models\AuditLog;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LinkStudentAccount
{
    public function bind(string $externalId, string $userId, ?User $actor = null): bool
    {
        return Str::isUuid($userId) && DB::transaction(function () use ($externalId, $userId, $actor): bool {
            $account = User::lockForUpdate()->find($userId);
            $student = Student::where('external_student_id', $externalId)->lockForUpdate()->first();
            if (! $account || ! $student || ($actor && $account->status !== 'active')
                || ($student->user_id !== null && $student->user_id !== $account->id)
                || Student::where('user_id', $account->id)->whereKeyNot($student->id)->exists()) {
                return false;
            }
            if ($student->user_id === null) {
                $student->forceFill(['user_id' => $account->id])->save();
                AuditLog::forceCreate(['subject_key' => 'student:'.$student->id, 'actor_id' => $actor?->id,
                    'action' => 'student.account_linked', 'occurred_at' => now(), 'details' => ['account' => $account->id]]);
            }

            return true;
        });
    }
}
