<?php

namespace Tests\Feature\Learning;

use App\Models\MaterialVersion;
use App\Models\Module;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Page;

class CaptionDeliveryTest extends LearningTestCase
{
    public function test_timed_captions_and_transcript_follow_private_revision_access(): void
    {
        Storage::fake('academic');
        $lesson = Module::where('offering_id', $this->offering->id)->sole();
        $url = $this->base.'/lessons/'.$lesson->id.'/materials';
        $vtt = "WEBVTT\n\n00:00:00.000 --> 00:00:01.000\nDistance is displacement over time.\n";
        $wav = 'RIFF'.pack('V', 8036).'WAVEfmt '.pack('VvvVVvv', 16, 1, 1, 8000, 8000, 1, 8).'data'.pack('V', 8000).str_repeat("\x80", 8000);
        $data = ['title' => 'Motion laboratory', 'download_allowed' => true, 'transcript' => 'Describe the displacement.'];
        $this->actingAs($this->teacher)->post($url, $data + [
            'file' => UploadedFile::fake()->createWithContent('lab.wav', $wav),
            'caption' => UploadedFile::fake()->createWithContent('lab.vtt', 'No timed captions'),
        ])->assertSessionHasErrors('caption');
        $this->assertCount(0, Storage::disk('academic')->allFiles());
        $this->post($url, $data + [
            'file' => UploadedFile::fake()->createWithContent('lab.wav', $wav),
            'caption' => UploadedFile::fake()->createWithContent('lab.vtt', $vtt),
        ])->assertSessionHasNoErrors();
        $version = MaterialVersion::whereNotNull('caption_file_id')->sole();
        $caption = route('learning.download', [$this->offering, $version, 'caption' => 1]);
        $this->actingAs($this->learner)->get($this->base)->assertInertia(fn (Page $p) => $p
            ->where('lessons.0.materials.1.versions.0.caption', $caption)
            ->where('lessons.0.materials.1.versions.0.transcript', $data['transcript'])
            ->where('lessons.0.materials.1.versions.0.media.src', route('learning.download', [$this->offering, $version, 'preview' => 1])));
        $response = $this->get($caption)->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertSame($vtt, $response->streamedContent());
        $this->actingAs($this->teacher)->post($url.'/'.$version->material_id, ['title' => 'Updated', 'download_allowed' => true, 'body' => 'Corrected text'])->assertSessionHasNoErrors();
        $this->get($caption)->assertOk();
        $this->actingAs($this->learner)->get($caption)->assertNotFound();
        $this->get($this->base)->assertDontSee('Describe the displacement.');
    }

    public function test_staff_learner_preview_filters_drafts_and_entire_unpublished_offerings(): void
    {
        Module::factory()->create(['offering_id' => $this->offering->id, 'position' => 2, 'kind' => 'draft:chapter']);
        $this->actingAs($this->teacher)->get($this->base)->assertInertia(fn (Page $p) => $p->has('lessons', 2));
        $this->get($this->base.'?preview=1')->assertInertia(fn (Page $p) => $p->has('lessons', 1)->where('staff', false));
        $this->offering->forceFill(['status' => 'draft'])->save();
        $this->get($this->base.'?preview=1')->assertInertia(fn (Page $p) => $p->has('lessons', 0));
    }
}
