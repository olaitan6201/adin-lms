<?php

namespace App\Services\Community;

use App\Enums\EnrolmentStatus;
use App\Enums\RoleCode;
use App\Enums\ScopeType;
use App\Models\Enrolment;
use App\Models\GroupMember;
use App\Models\Module;
use App\Models\RoleGrant;
use App\Models\Student;
use App\Models\User;
use App\Services\Learning\LessonAccess;
use App\Services\Roster\RegistrationInterval;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

final class CommunityAudience
{
    public function materialLearners(Module $lesson): Builder
    {
        return $this->forMaterialRelease($lesson->offering_id, $lesson->prerequisite_id, null);
    }

    public function forMaterialRelease(string $offering, ?string $prerequisite, ?CarbonImmutable $releaseAt): Builder
    {
        return $this->learners($offering, registeredBy: $releaseAt)
            ->when($prerequisite, fn ($q) => $q->whereIn('id', LessonAccess::completers($offering, $prerequisite, $releaseAt)));
    }

    /** @return Builder<User> */
    public function learners(string $offering, ?string $group = null, ?CarbonImmutable $registeredBy = null): Builder
    {
        $registrations = Enrolment::where('offering_id', $offering)->where('status', EnrolmentStatus::Registered);
        if ($registeredBy !== null) {
            RegistrationInterval::startedBy($registrations, $registeredBy);
        }
        if ($group !== null) {
            $groupMembers = GroupMember::where('group_id', $group)
                ->whereHas('group', fn (Builder $groups) => $groups->where('offering_id', $offering));
            $registrations->whereIn('id', $groupMembers->select('enrolment_id'));
        }

        $students = Student::whereIn('id', $registrations->select('student_id'));

        return User::where('status', 'active')->whereIn('id', $students->select('user_id'));
    }

    /** @return Builder<User> */
    public function teachers(string $offering): Builder
    {
        $grants = RoleGrant::whereHas('role', fn (Builder $roles) => $roles->where('code', RoleCode::Lecturer))
            ->whereHas('accessScope', fn (Builder $scopes) => $scopes->where('scope_key', ScopeType::Offering->key($offering)));

        return User::where('status', 'active')
            ->whereIn('id', $grants->select('user_id'))
            ->whereHas('lecturer.allocations', fn (Builder $allocations) => $allocations->where('offering_id', $offering));
    }

    /** @return Builder<User> */
    public function members(string $offering): Builder
    {
        $learners = $this->learners($offering)->select('id');
        $teachers = $this->teachers($offering)->select('id');

        return User::whereIn('id', $learners->union($teachers));
    }
}
