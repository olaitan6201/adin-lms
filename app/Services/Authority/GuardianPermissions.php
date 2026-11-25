<?php

namespace App\Services\Authority;

use App\Enums\GuardianPermissionEvent;
use App\Enums\PermissionCode;
use App\Models\AuditLog;
use App\Models\GuardianAccess;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class GuardianPermissions
{
    public function __construct(private readonly ScopedAuthority $authority) {}

    public function approve(User $actor, string $email, string $reference): void
    {
        DB::transaction(function () use ($actor, $email, $reference): void {
            $guardian = User::where('email', User::canonicalEmail($email))->where('status', 'active')->lockForUpdate()->first();
            if (! $guardian || $guardian->is($actor) || ! $this->authority->institutionAllows($guardian, PermissionCode::ProgressReadApproved)) {
                throw ValidationException::withMessages(['guardian_email' => 'Enter another active account with the guardian role.']);
            }

            $student = Student::where('external_student_id', $reference)->firstOrFail();
            $access = GuardianAccess::where('guardian_id', $guardian->id)->where('student_id', $student->id)->lockForUpdate()->first();
            if ($access && ! $access->revoked_at && in_array('completed_lessons', $access->allowed_fields, true)) {
                return;
            }

            $access ??= new GuardianAccess;
            $access->forceFill(['guardian_id' => $guardian->id, 'student_id' => $student->id,
                'approved_by' => $actor->id, 'allowed_fields' => ['completed_lessons'], 'revoked_at' => null])->save();
            $this->audit($actor, $access, GuardianPermissionEvent::Approved);
        });
    }

    public function revoke(User $actor, GuardianAccess $access): void
    {
        DB::transaction(function () use ($actor, $access): void {
            $current = GuardianAccess::lockForUpdate()->findOrFail($access->id);
            if (! $current->revoked_at) {
                $current->forceFill(['revoked_at' => now()])->save();
                $this->audit($actor, $current, GuardianPermissionEvent::Revoked);
            }
        });
    }

    private function audit(User $actor, GuardianAccess $access, GuardianPermissionEvent $event): void
    {
        AuditLog::forceCreate(['subject_key' => 'guardian_access:'.$access->id, 'action' => $event->value,
            'actor_id' => $actor->id, 'occurred_at' => now(), 'details' => ['fields' => $access->allowed_fields]]);
    }
}
