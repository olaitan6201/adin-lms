<?php

namespace App\Http\Controllers\Community;

use App\Enums\EnrolmentStatus;
use App\Enums\StudyGroupAuditAction;
use App\Http\Requests\Community\StudyGroupRequest;
use App\Models\AuditLog;
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
            $creating = $group === null;
            $team = $creating ? new StudyGroup : StudyGroup::where('offering_id', $offering->id)
                ->lockForUpdate()->findOrFail($group);
            $beforeMembers = $creating ? collect() : GroupMember::with('enrolment.student.user:id,full_name')
                ->where('group_id', $team->id)->get()->keyBy('enrolment_id');
            $selected = $request->validated('members', []);
            $registrations = Enrolment::with('student.user:id,full_name')
                ->where('offering_id', $offering->id)
                ->where('status', EnrolmentStatus::Registered)
                ->whereIn('id', $selected)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();
            if ($registrations->count() !== count($selected)) {
                throw ValidationException::withMessages(['members' => 'Choose current registrations in this course.']);
            }

            $ids = $registrations->pluck('id');
            $added = $ids->diff($beforeMembers->keys());
            $removed = $beforeMembers->keys()->diff($ids);
            $nameBefore = $creating ? null : $team->name;
            $nameAfter = $request->validated('name');

            if (! $creating && $nameBefore === $nameAfter && $added->isEmpty() && $removed->isEmpty()) {
                return;
            }

            $team->forceFill(['name' => $nameAfter, 'offering_id' => $offering->id])->save();
            GroupMember::where('group_id', $team->id)->whereNotIn('enrolment_id', $ids)->delete();
            foreach ($ids as $id) {
                GroupMember::unguarded(fn () => GroupMember::firstOrCreate(['group_id' => $team->id, 'enrolment_id' => $id]));
            }

            AuditLog::forceCreate([
                'actor_id' => $request->user()->id,
                'action' => StudyGroupAuditAction::Saved->value,
                'subject_key' => 'study-group:'.$team->id,
                'occurred_at' => now(),
                'details' => [
                    'offering_id' => $offering->id,
                    'group_id' => $team->id,
                    'name_before' => $nameBefore,
                    'name_after' => $nameAfter,
                    'added' => $added->map(fn (string $id): array => [
                        'enrolment_id' => $id,
                        'label' => $this->label($registrations->firstWhere('id', $id)),
                    ])->values()->all(),
                    'removed' => $removed->map(fn (string $id): array => [
                        'enrolment_id' => $id,
                        'label' => $this->label($beforeMembers->first(
                            fn (GroupMember $member): bool => $member->enrolment_id === $id,
                        )?->enrolment),
                    ])->values()->all(),
                ],
            ]);
        });

        return back();
    }

    private function label(?Enrolment $enrolment): string
    {
        return $enrolment?->student?->user?->full_name
            ?? $enrolment?->student?->external_student_id
            ?? 'Former learner';
    }
}
