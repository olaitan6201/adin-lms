<?php

namespace Tests\Feature\Assessment;

use App\Enums\StudyGroupAuditAction;
use App\Models\AssessmentItem;
use App\Models\Assignment;
use App\Models\AuditLog;
use App\Models\Enrolment;
use App\Models\StudyGroup;
use App\Models\SubmissionRecipient;
use App\Models\SubmissionVersion;

class GroupMembershipSnapshotTest extends AssessmentCase
{
    public function test_membership_replacement_does_not_rewrite_frozen_submission_recipients(): void
    {
        $this->setupItems(['assignment']);
        $item = AssessmentItem::firstOrFail();
        $this->post("/assessment-items/$item->id/assignment", [
            'instructions' => 'Submit once as a group',
            'opens_at' => now()->subHour(),
            'due_at' => now()->addHour(),
            'closes_at' => now()->addHours(2),
            'formats' => ['txt'],
            'max_bytes' => 1000,
            'group_work' => 1,
            'allow_late' => 0,
            'editable' => 1,
        ])->assertSessionHasNoErrors();
        $assignment = Assignment::firstOrFail();
        $newMember = Enrolment::factory()->create(['offering_id' => $this->offering->id]);
        $this->post(route('community.groups.create', $this->offering), [
            'name' => 'Project team',
            'members' => [$this->member->id, $newMember->id],
        ])->assertSessionHasNoErrors()->assertRedirect();
        $team = StudyGroup::where('offering_id', $this->offering->id)->sole();
        $url = "/assignments/$assignment->id";

        $this->as($this->member->student->user)->post($url, [
            'body' => 'Original group answer',
            'group_id' => $team->id,
        ])->assertSessionHasNoErrors()->assertRedirect();
        $original = SubmissionVersion::firstOrFail();

        $this->as($this->marker)->post(route('community.groups.update', [$this->offering, $team]), [
            'name' => 'Project team',
            'members' => [$newMember->id],
        ])->assertSessionHasNoErrors()->assertRedirect();

        $this->as($newMember->student->user)->post($url, [
            'body' => 'Revised group answer',
            'group_id' => $team->id,
        ])->assertSessionHasNoErrors()->assertRedirect();
        $revision = SubmissionVersion::where('revision', 2)->sole();

        $this->assertSame([
            $this->member->id,
            $newMember->id,
        ], SubmissionRecipient::where('version_id', $original->id)
            ->orderBy('enrolment_id')->pluck('enrolment_id')->all());
        $this->assertSame([
            $newMember->id,
        ], SubmissionRecipient::where('version_id', $revision->id)->pluck('enrolment_id')->all());
        $this->assertSame(2, AuditLog::where('action', StudyGroupAuditAction::Saved->value)->count());
    }
}
