<?php

namespace App\Http\Controllers\Community;

use App\Enums\EnrolmentStatus;
use App\Http\Requests\Community\StudyGroupRequest;
use App\Models\Enrolment;
use App\Models\GroupMember;
use App\Models\Offering;
use App\Models\StudyGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class StudyGroupController
{
    public function save(StudyGroupRequest $request, Offering $offering, ?string $group = null): RedirectResponse
    {
        DB::transaction(function () use ($request, $offering, $group): void {
            $team = $group === null ? new StudyGroup : StudyGroup::where('offering_id', $offering->id)
                ->lockForUpdate()->findOrFail($group);
            $selected = $request->validated('members', []);
            $ids = Enrolment::where('offering_id', $offering->id)->where('status', EnrolmentStatus::Registered)
                ->whereIn('id', $selected)->orderBy('id')->lockForUpdate()->pluck('id');
            if ($ids->count() !== count($selected)) {
                throw ValidationException::withMessages(['members' => 'Choose current registrations in this course.']);
            }
            $team->forceFill(['name' => $request->validated('name'), 'offering_id' => $offering->id])->save();
            GroupMember::where('group_id', $team->id)->whereNotIn('enrolment_id', $ids)->delete();
            foreach ($ids as $id) {
                GroupMember::unguarded(fn () => GroupMember::firstOrCreate(['group_id' => $team->id, 'enrolment_id' => $id]));
            }
        });

        return back();
    }
}
