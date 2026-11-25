<?php

namespace Tests\Feature;

use App\Models\Enrolment;
use App\Models\Forum;
use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Models\Post;
use App\Services\Learning\PrivateUpload;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Support\OperationsAccess;
use Tests\TestCase;
use ZipArchive;

class NativeCourseBackupTest extends TestCase
{
    use OperationsAccess, RefreshDatabase;

    public function test_snapshot_preserves_file_bytes_activity_and_release_state_without_learner_data(): void
    {
        Storage::fake('academic');
        $user = $this->operator();
        $source = Offering::factory()->create();
        $target = Offering::factory()->create();
        $lesson = Module::factory()->create(['offering_id' => $source->id, 'kind' => 'draft:topic']);
        $material = LearningMaterial::factory()->create(['module_id' => $lesson->id, 'download_allowed' => false]);
        $pixel = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4eQAAAAASUVORK5CYII=', true);
        $file = app(PrivateUpload::class)->store(UploadedFile::fake()->createWithContent('Plate.png', $pixel));
        MaterialVersion::factory()->create(['material_id' => $material->id, 'body' => 'Old revision']);
        MaterialVersion::factory()->create(['material_id' => $material->id, 'file_id' => $file->id, 'revision' => 2, 'body' => 'Instructions']);
        $forum = Forum::forceCreate(['offering_id' => $source->id, 'title' => 'Reading circle']);
        Post::forceCreate(['forum_id' => $forum->id, 'author_id' => $user->id, 'body' => 'Private student reply', 'posted_at' => now(), 'moderation_state' => 'visible']);
        $enrolment = Enrolment::factory()->create(['offering_id' => $source->id]);
        $download = $this->get("/operations/courses/{$source->id}/export/native")->assertOk();
        $upload = UploadedFile::fake()->createWithContent('backup.zip', $download->getContent());
        $zip = new ZipArchive;
        $zip->open($upload->getPathname());
        $this->assertSame(2, $zip->numFiles);
        $manifest = $zip->getFromName('backup.json');
        foreach ([$user->id, $enrolment->id, 'Private student reply', 'Old revision', $file->object_key] as $excluded) {
            $this->assertStringNotContainsString($excluded, $manifest);
        }

        $zip->close();
        $this->postJson("/operations/courses/{$target->id}/import", ['package' => $upload])->assertCreated()->assertJsonPath('imported', 2);
        $restored = Module::where('offering_id', $target->id)->sole();
        $copy = LearningMaterial::where('module_id', $restored->id)->sole();
        $revision = MaterialVersion::where('material_id', $copy->id)->sole();
        $this->assertSame('draft:topic', $restored->kind);
        $this->assertFalse($copy->download_allowed);
        $this->assertSame('Instructions', $revision->body);
        $this->assertNotSame($file->object_key, $revision->file->object_key);
        $this->assertSame('image/png', $revision->file->media_type);
        $this->assertSame($pixel, Storage::disk('academic')->get($revision->file->object_key));
        $this->assertDatabaseHas('forums', ['offering_id' => $target->id, 'title' => 'Reading circle']);
        $this->assertDatabaseCount('posts', 1);
        $this->assertDatabaseCount('enrolments', 1);
        $this->assertDatabaseCount('grades', 0);
        $this->postJson("/operations/courses/{$target->id}/import", ['package' => $upload])->assertConflict();
    }

    public function test_attachment_validation_failure_rolls_back_prior_objects_and_rows(): void
    {
        Storage::fake('academic');
        $this->operator();
        $target = Offering::factory()->create();
        $materials = [];
        $upload = UploadedFile::fake()->createWithContent('broken.zip', '');
        $zip = new ZipArchive;
        $zip->open($upload->getPathname(), ZipArchive::OVERWRITE);
        foreach ([1 => 'Notes.txt', 2 => 'Image.png'] as $index => $name) {
            $asset = "asset-$index.bin";
            $bytes = "Plain text number $index.";
            $zip->addFromString($asset, $bytes);
            $materials[] = ['title' => 'Exercise', 'url' => null, 'body' => null, 'transcript' => null, 'download' => true,
                'attachment' => ['name' => $name, 'asset' => $asset, 'sha256' => hash('sha256', $bytes)]];
        }

        $zip->addFromString('backup.json', json_encode(['format' => 'adin-course-2', 'forums' => [],
            'lessons' => [['title' => 'Field trip', 'kind' => 'weekly', 'body' => null, 'materials' => $materials]]]));
        $zip->close();
        $this->postJson("/operations/courses/{$target->id}/import", ['package' => $upload])->assertUnprocessable();
        $this->assertSame([], Storage::disk('academic')->allFiles());
        $this->assertDatabaseCount('modules', 0);
        $this->assertDatabaseCount('files', 0);
        $this->assertDatabaseMissing('audit_logs', ['action' => 'course.imported']);
    }

    public function test_restore_refuses_an_enrolled_target_even_without_lessons(): void
    {
        $target = Offering::factory()->create();
        Enrolment::factory()->create(['offering_id' => $target->id]);
        $this->operator();
        $upload = UploadedFile::fake()->createWithContent('forum.zip', '');
        $zip = new ZipArchive;
        $zip->open($upload->getPathname(), ZipArchive::OVERWRITE);
        $zip->addFromString('backup.json', '{"format":"adin-course-2","lessons":[],"forums":["Workshop"]}');
        $zip->close();
        $this->postJson("/operations/courses/{$target->id}/import", ['package' => $upload])->assertConflict();
        $this->assertDatabaseCount('forums', 0);
    }
}
