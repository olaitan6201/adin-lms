<?php

namespace Tests\Feature\Learning;

use App\Models\LearningMaterial;
use App\Models\LessonProgress;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Page;

class ContentDeliveryTest extends LearningTestCase
{
    public function test_draft_preview_and_completion_follow_live_registration_and_schedule(): void
    {
        $this->get($this->base)->assertRedirect(route('login'));
        $data = [
            'title' => 'Systems',
            'kind' => 'chapter',
            'body' => 'Discuss two examples.',
            'position' => 2,
            'published' => 0,
        ];
        $this->actingAs($this->learner)
            ->post($this->base.'/lessons', $data)
            ->assertForbidden();
        $this->actingAs($this->teacher)
            ->post($this->base.'/lessons', $data)
            ->assertSessionHasNoErrors()
            ->assertRedirect($this->base);
        $this->post($this->base.'/lessons', [
            ...$data,
            'kind' => 'unknown',
            'position' => 3,
        ])->assertSessionHasErrors('kind');

        $lesson = Module::whereTitle('Systems')->sole();
        $url = $this->base.'/lessons/'.$lesson->id;
        $this->get($this->base)->assertInertia(fn (Page $p) => $p->where('lessons.1.title', 'Systems'));
        $this->actingAs($this->learner)
            ->get($this->base)
            ->assertInertia(fn (Page $p) => $p->has('lessons', 1));
        $this->post($url.'/complete')->assertNotFound();
        $this->actingAs($this->teacher)
            ->post($url, [...$data, 'published' => 1])
            ->assertSessionHasNoErrors();
        $this->actingAs($this->learner)
            ->post($url.'/complete')
            ->assertRedirect();
        $first = LessonProgress::sole()->completed_at;
        $this->travel(1)->hour();
        $this->actingAs($this->teacher)
            ->post($url, [...$data, 'published' => 1, 'body' => 'Updated'])
            ->assertSessionHasNoErrors();
        $this->actingAs($this->learner)
            ->post($url.'/complete')
            ->assertRedirect();
        $this->assertTrue(LessonProgress::sole()->completed_at->eq($first));
        $other = Offering::whereExternalOfferingId('DEMO-CSC102-2026-1')->sole();
        $this->post(route('learning.complete', [$other, $lesson]))->assertNotFound();
        $this->withdraw();
        $this->post($url.'/complete')->assertNotFound();
        $this->get($this->base)->assertNotFound();
    }

    public function test_revision_download_rechecks_scope_publication_schedule_and_permission(): void
    {
        Storage::fake('local');
        $lesson = Module::whereOfferingId($this->offering->id)->sole();
        $url = $this->base.'/lessons/'.$lesson->id.'/materials';
        $data = ['title' => 'Practical', 'download_allowed' => 1];
        $upload = fn () => UploadedFile::fake()->createWithContent('lab.py', "print('hello')\n");
        $this->actingAs($this->teacher)
            ->post($url, [...$data, 'file' => $upload()])
            ->assertSessionHasNoErrors()
            ->assertRedirect();
        $material = LearningMaterial::whereTitle('Practical')->sole();
        $version = MaterialVersion::whereMaterialId($material->id)->sole();
        $direct = route('learning.download', [$this->offering, $version]);
        Storage::disk('local')->assertExists($version->file->object_key);
        $this->actingAs($this->learner)->get($direct)->assertDownload('lab.py');
        $other = Offering::whereExternalOfferingId('DEMO-CSC102-2026-1')->sole();
        $this->get(route('learning.download', [$other, $version]))->assertNotFound();
        $material->forceFill(['opens_at' => now()->addDay()])->save();
        $this->get($direct)->assertNotFound();
        $material->forceFill(['opens_at' => null, 'download_allowed' => false])->save();
        $this->get($direct)->assertNotFound();
        $this->actingAs($this->teacher)
            ->post($url.'/'.$material->id, [...$data, 'file' => $upload()])
            ->assertSessionHasNoErrors();
        $second = MaterialVersion::whereMaterialId($material->id)->whereRevision(2)->sole();
        $this->assertSame($this->teacher->id, $version->created_by);
        $this->get($direct)->assertDownload();
        $this->actingAs($this->learner)->get($direct)->assertNotFound();
        $this->get(route('learning.download', [$this->offering, $second]))->assertDownload();
        $this->withdraw();
        $this->get(route('learning.download', [$this->offering, $second]))->assertNotFound();
    }

    public function test_disallowed_files_oversize_and_unsafe_links_never_create_resources(): void
    {
        $lesson = Module::whereOfferingId($this->offering->id)->sole();
        $url = route('learning.revisions.store', [$this->offering, $lesson]);
        $data = ['title' => 'Invalid', 'download_allowed' => 1];
        $this->actingAs($this->teacher);
        foreach (['bad.exe', 'fake.pdf'] as $name) {
            $this->post($url, [
                ...$data,
                'file' => UploadedFile::fake()->createWithContent($name, 'plain text'),
            ])->assertSessionHasErrors('file');
        }

        $this->post($url, [
            ...$data,
            'file' => UploadedFile::fake()->create('big.mp4', 51201, 'video/mp4'),
        ])->assertSessionHasErrors('file');
        $this->post($url, [...$data, 'external_url' => 'javascript:invalid'])->assertSessionHasErrors(
            'external_url',
        );
        $this->assertDatabaseMissing('learning_materials', ['title' => 'Invalid']);
    }
}
