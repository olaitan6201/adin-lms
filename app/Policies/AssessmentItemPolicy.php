<?php

namespace App\Policies;

use App\Models\AssessmentItem;
use App\Models\Enrolment;
use App\Models\Offering;
use App\Models\RoleGrant;
use App\Models\TeachingAllocation;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class AssessmentItemPolicy
{
    public function mark(User $user, AssessmentItem $item): bool
    {
        return $this->teaches($user, $item->gradebook->offering);
    }

    public function teaches(User $user, Offering $offering): bool
    {
        return TeachingAllocation::where('offering_id', $offering->id)->whereHas('lecturer', fn (Builder $q) => $q->where('user_id', $user->id))->exists()
            && RoleGrant::where('user_id', $user->id)->whereHas('role', fn (Builder $q) => $q->where('code', 'lecturer'))
                ->whereHas('accessScope', fn (Builder $q) => $q->where('scope_key', 'offering:'.$offering->id))->exists();
    }

    public function learner(User $user, string $offering): Builder
    {
        return Enrolment::where('offering_id', $offering)->where('status', 'registered')->whereHas('student', fn (Builder $q) => $q->where('user_id', $user->id));
    }
}
