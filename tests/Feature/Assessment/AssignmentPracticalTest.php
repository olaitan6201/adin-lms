<?php

namespace Tests\Feature\Assessment;

use App\Models\AssessmentItem;
use App\Models\Assignment;
use App\Models\Enrolment;
use App\Models\SubmissionFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class AssignmentPracticalTest extends AssessmentCase
{
    public function test_practical_brief_and_inert_source_download_follow_current_offering_access(): void
    {
        Storage::fake('local');
        $this->setupItems(['assignment']);
        $item = AssessmentItem::sole();
        $brief = "Show your working.\nInclude a Python source file.";
        $this->post("/assessment-items/$item->id/assignment", [
            'instructions' => $brief,
            'opens_at' => now()->addHour(),
            'due_at' => now()->addHours(4),
            'closes_at' => now()->addDay(),
            'formats' => ['py'],
            'max_bytes' => 256,
        ])->assertSessionHasNoErrors();
        $url = '/assignments/'.Assignment::sole()->id;
        $instructions = "$url/instructions";
        $this->get($instructions)->assertContent($brief);
        $this->as($this->member->student->user)->get($instructions)->assertNotFound();
        $this->travel(2)->hours();
        $this->get($instructions)->assertDownload('assignment-instructions.txt')->assertContent($brief);
        $source = "print('submitted for review')\n";
        $this->postJson($url, ['script' => UploadedFile::fake()->createWithContent('source.js', $source)])
            ->assertUnprocessable();
        $this->postJson($url, ['script' => UploadedFile::fake()->createWithContent('source.py', "%PDF-1.7\n")])
            ->assertUnprocessable();
        $this->assertDatabaseCount('submission_versions', 0);
        $this->post($url, ['script' => UploadedFile::fake()->createWithContent('source.py', $source)])
            ->assertSessionHasNoErrors()->assertRedirect();
        $download = $this->get("$url/files/".SubmissionFile::sole()->file_id)
            ->assertDownload('source.py')->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertSame($source, $download->streamedContent());

        $this->as(Enrolment::factory()->create()->student->user)->get($instructions)->assertNotFound();
        $this->member->forceFill(['status' => 'withdrawn'])->save();
        $this->as($this->member->student->user)->get($instructions)->assertNotFound();
    }
}
