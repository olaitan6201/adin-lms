<?php

namespace App\Services\Community;

use App\Enums\EnrolmentStatus;
use App\Models\GroupMember;
use App\Models\RoleGrant;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

final class CommunityAudience
{
    public function learners(string $offering, ?string $group = null): Builder
    {
        return User::where('status', 'active')->whereHas('student.enrolments', function (Builder $q) use ($offering, $group): void {
            $q->where('offering_id', $offering)->where('status', EnrolmentStatus::Registered);
            if ($group !== null) {
                $q->whereIn('id', GroupMember::select('enrolment_id')->where('group_id', $group)
                    ->whereHas('group', fn (Builder $g) => $g->where('offering_id', $offering)));
            }
        });
    }

    public function teachers(string $offering): Builder
    {
        return User::where('status', 'active')->whereHas('lecturer.allocations', fn (Builder $q) => $q->where('offering_id', $offering))
            ->whereIn('id', RoleGrant::select('user_id')->whereHas('role', fn ($q) => $q->where('code', 'lecturer'))
                ->whereHas('accessScope', fn ($q) => $q->where('scope_key', 'offering:'.$offering)));
    }

    public function members(string $offering): Builder
    {
        return User::whereIn('id', $this->learners($offering)->select('id')->union($this->teachers($offering)->select('id')));
    }
}
