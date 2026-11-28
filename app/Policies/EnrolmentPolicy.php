<?php

namespace App\Policies;

use App\Enums\EnrolmentStatus;
use App\Models\Enrolment;
use App\Models\Offering;
use App\Models\OfficialRegistration;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;

final class EnrolmentPolicy
{
    public function __construct(private readonly ScopedAuthority $authority) {}

    public function linkPlacement(User $user, Enrolment $enrolment, OfficialRegistration $registration, Offering $offering): bool
    {
        return $enrolment->status === EnrolmentStatus::Registered
            && $this->replayPlacement($user, $enrolment, $registration, $offering);
    }

    public function replayPlacement(User $user, Enrolment $enrolment, OfficialRegistration $registration, Offering $offering): bool
    {
        return $this->authority->registrarAllows($user)
            && $enrolment->student_id === $registration->student_id
            && $enrolment->offering_id === $offering->id;
    }
}
