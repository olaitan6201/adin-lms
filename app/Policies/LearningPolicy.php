<?php

namespace App\Policies;

use App\Enums\EnrolmentStatus;
use App\Enums\Learning\LessonKind;
use App\Enums\OfferingStatus;
use App\Models\Enrolment;
use App\Models\LearningMaterial;
use App\Models\Module;
use App\Models\Offering;
use App\Models\TeachingAllocation;
use App\Models\User;

final class LearningPolicy
{
    public function enrolment(string $user, Offering $offering): ?Enrolment
    {
        return Enrolment::where('offering_id', $offering->id)
            ->where('status', EnrolmentStatus::Registered)
            ->whereHas('student', fn ($q) => $q->where('user_id', $user))
            ->first();
    }

    public function allocated(string $user, Offering $offering): bool
    {
        return TeachingAllocation::where('offering_id', $offering->id)
            ->whereHas('lecturer', fn ($q) => $q->where('user_id', $user))
            ->exists();
    }

    public function audience(User $user, Offering $offering): bool
    {
        $staff = $this->allocated($user->id, $offering);
        abort_unless(
            $staff || ($this->published($offering) && $this->enrolment($user->id, $offering)),
            404,
        );

        return $staff;
    }

    public function published(Offering $offering): bool
    {
        return $offering->status === OfferingStatus::Published;
    }

    public function released(Module|LearningMaterial $item): bool
    {
        return ! ($item instanceof Module && str_starts_with($item->kind, LessonKind::DRAFT_PREFIX)) &&
            ! ($item instanceof LearningMaterial && $item->restrictions) &&
            (! $item->opens_at || $item->opens_at->lte(now())) &&
            (! $item->closes_at || $item->closes_at->gt(now()));
    }
}
