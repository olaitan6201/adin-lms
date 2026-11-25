<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\AssessmentScore;
use App\Models\Assignment;
use App\Models\AssignmentReference;
use App\Models\Enrolment;
use App\Models\SubmissionVersion;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class IndividualSubmissionTest extends AssessmentCase
{
    public function test_reference_and_marked_downloads_require_current_access_and_release(): void
    {
        Storage::fake('local');
        $this->setupItems(['assignment']);
        $item = AssessmentItem::firstOrFail();
        $this->post("/assessment-items/$item->id/assignment", [
            'instructions' => 'Write a sentence',
            'opens_at' => now()->subHour(),
            'due_at' => now()->addHour(),
            'closes_at' => now()->addDay(),
            'formats' => ['txt'],
            'max_bytes' => 64,
            'reference' => UploadedFile::fake()->createWithContent('guide.txt', 'Short guide'),
        ])->assertRedirect();
        $assignment = Assignment::firstOrFail();
        $url = "/assignments/$assignment->id";
        $ref = AssignmentReference::firstOrFail()->file_id;
        $outside = Enrolment::factory()->create();
        $this->as($outside->student->user)->get("$url/files/$ref")->assertNotFound();
        $this->as($this->member->student->user)->get("$url/files/$ref")->assertDownload('guide.txt');
        $this->postJson($url, ['body' => str_repeat('x', 65)])->assertUnprocessable();
        $this->post($url, ['body' => 'First attempt'])->assertRedirect();
        $this->post($url, ['body' => 'Override first attempt'])->assertConflict();
        $version = SubmissionVersion::firstOrFail();
        $mark = "/submission-versions/$version->id/marks";
        $data = ['points' => '10', 'reason' => 'Marked script'];
        $this->as($this->marker)->post(
            $mark,
            $data + ['script' => UploadedFile::fake()->createWithContent('private.txt', 'Draft comments')],
        )->assertRedirect();
        $draft = AssessmentScore::firstOrFail()->marked_file_id;
        $this->as($this->member->student->user)->get("$url/files/$draft")->assertNotFound();
        $this->as($this->marker)->post($mark, $data + [
            'release' => 1,
            'script' => UploadedFile::fake()->createWithContent('returned.txt', 'Final comments'),
        ])->assertRedirect();
        $returned = AssessmentScore::where('revision', 2)->firstOrFail()->marked_file_id;
        $this->as($this->member->student->user)->get("$url/files/$returned")->assertDownload('returned.txt');
        $this->member->forceFill(['status' => 'withdrawn'])->save();
        $this->get("$url/files/$returned")->assertNotFound();
    }
}
