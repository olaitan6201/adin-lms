<?php

namespace App\Policies;

use App\Models\GuardianAccess;
use App\Models\Student;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;

class StudentPolicy
{
    public function __construct(private readonly ScopedAuthority $authority) {}

    public function viewHistory(User $user, Student $student): bool
    {
        return $student->user_id === $user->id;
    }

    public function viewCompletedLessons(User $user, Student $student): bool
    {
        return $this->authority->institutionAllows($user, 'progress.read_approved')
            && GuardianAccess::where('guardian_id', $user->id)->where('student_id', $student->id)
                ->whereNotNull('approved_by')->whereNull('revoked_at')
                ->whereJsonContains('allowed_fields', 'completed_lessons')->exists();
    }
}
