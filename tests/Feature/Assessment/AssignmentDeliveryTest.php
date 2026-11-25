<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\Assignment;
use App\Models\Enrolment;
use App\Models\GroupMember;
use App\Models\StudyGroup;
use App\Models\SubmissionFile;
use App\Models\SubmissionVersion;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Page;

class AssignmentDeliveryTest extends AssessmentCase
{
    public function test_group_receipts_files_and_marks_follow_the_frozen_recipient_list(): void
    {
        Storage::fake('local');
        $this->setupItems(['assignment']);
        $item = AssessmentItem::firstOrFail();
        $this->post("/assessment-items/$item->id/assignment", [
            'instructions' => 'Explain your result',
            'opens_at' => now()->subDays(2),
            'due_at' => now()->subDay(),
            'closes_at' => now()->addHour(),
            'formats' => ['txt'],
            'max_bytes' => 1000,
            'group_work' => 1,
            'allow_late' => 1,
            'editable' => 1,
        ])->assertSessionHasNoErrors();
        $assignment = Assignment::firstOrFail();
        $url = "/assignments/$assignment->id";
        $group = StudyGroup::forceCreate([
            'offering_id' => $this->offering->id,
            'name' => 'Red',
        ]);
        GroupMember::forceCreate([
            'group_id' => $group->id,
            'enrolment_id' => $this->member->id,
        ]);
        $other = Enrolment::factory()->create(['offering_id' => $this->offering->id]);
        $this->as($other->student->user)->post($url, [
            'body' => 'outsider',
            'group_id' => $group->id,
        ])->assertForbidden();
        $this->as($this->member->student->user)->post($url, [
            'script' => UploadedFile::fake()->createWithContent('answer.txt', 'My original answer.'),
            'group_id' => $group->id,
        ])->assertSessionHasNoErrors()->assertRedirect();
        $version = SubmissionVersion::firstOrFail();
        $this->post($url, ['body' => 'Revised', 'group_id' => $group->id])->assertRedirect();
        $this->assertSame(2, SubmissionVersion::distinct()->count('receipt'));
        $file = SubmissionFile::firstOrFail()->file_id;
        $this->get("$url/files/$file")->assertDownload('answer.txt');
        GroupMember::forceCreate([
            'group_id' => $group->id,
            'enrolment_id' => $other->id,
        ]);
        $this->as($other->student->user)->get("$url/files/$file")->assertNotFound();
        $marks = "/submission-versions/$version->id/marks";
        $data = [
            'points' => '7.25',
            'reason' => 'Original script',
            'feedback' => 'Private feedback',
        ];
        $this->post($marks, $data)->assertForbidden();
        $this->as($this->marker)->post($marks, $data)->assertRedirect();
        $this->as($this->member->student->user)
            ->get($url)
            ->assertInertia(fn (Page $p) => $p->has('rows', 2)
                ->where('rows.0.late', true)->has('rows.0.scores', 0)->has('rows.1.scores', 0));
        $this->as($this->marker)->post($marks, $data + ['release' => 1])->assertRedirect();
        $this->as($this->member->student->user)->get($url)->assertSee('Private feedback');
        $this->as($other->student->user)->get($url)->assertDontSee('Private feedback');
        $this->travel(2)->hours();
        $this->postJson($url, [
            'body' => 'Too late',
            'group_id' => $group->id,
        ])->assertUnprocessable();
        $this->assertDatabaseCount('submission_versions', 2);
    }
}
