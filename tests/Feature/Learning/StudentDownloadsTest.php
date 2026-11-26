<?php

namespace Tests\Feature\Learning;

use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Page;

class StudentDownloadsTest extends LearningTestCase
{
    public function test_guest_and_non_student_cannot_open_the_student_library(): void
    {
        $this->get('/student/downloads')->assertRedirect(route('login'));
        $this->actingAs($this->teacher)->get('/student/downloads')->assertForbidden();
    }

    public function test_current_file_uses_authorized_route_and_disappears_after_withdrawal(): void
    {
        $version = $this->upload();
        $url = route('learning.download', [$this->offering, $version]);
        $this->actingAs($this->learner)->get('/student/downloads')->assertInertia(fn (Page $p) => $p
            ->component('Learning/Downloads')->has('materials', 1)
            ->where('materials.0.download', $url)->where('materials.0.filename', 'lab.py')
            ->where('materials.0.course', 'DEMO-CSC101 · Introduction to Computing')
            ->missing('materials.0.object_key'));
        $this->get($url)->assertDownload('lab.py');
        $this->withdraw();
        $this->assertEmptyLibrary();
        $this->get($url)->assertNotFound();
    }

    public function test_student_cannot_discover_locked_restricted_or_unpublished_materials(): void
    {
        $version = $this->upload();
        $material = $version->material;
        $lesson = $material->module;
        $prior = Module::factory()->create(['offering_id' => $this->offering->id, 'position' => 2]);
        $this->actingAs($this->learner);
        $lesson->forceFill(['prerequisite_id' => $prior->id])->save();
        $this->assertEmptyLibrary();
        $lesson->forceFill(['prerequisite_id' => null, 'kind' => 'draft:chapter'])->save();
        $this->assertEmptyLibrary();
        $lesson->forceFill(['kind' => 'chapter'])->save();
        $material->forceFill(['opens_at' => now()->addDay()])->save();
        $this->assertEmptyLibrary();
        $material->forceFill(['opens_at' => null, 'download_allowed' => false])->save();
        $this->assertEmptyLibrary();
        $material->forceFill(['download_allowed' => true, 'restrictions' => ['restricted']])->save();
        $this->assertEmptyLibrary();
        $material->forceFill(['restrictions' => null])->save();
        $this->offering->forceFill(['status' => 'unpublished'])->save();
        $this->assertEmptyLibrary();
    }

    public function test_unvalidated_missing_and_superseded_files_are_not_offered(): void
    {
        $version = $this->upload();
        $file = $version->file;
        $this->actingAs($this->learner);
        $file->forceFill(['validation_status' => 'pending'])->save();
        $this->assertEmptyLibrary();
        $file->forceFill(['validation_status' => 'validated'])->save();
        MaterialVersion::factory()->create(['material_id' => $version->material_id, 'revision' => 2]);
        $this->assertEmptyLibrary();
        MaterialVersion::whereMaterialId($version->material_id)->whereRevision(2)->delete();
        Storage::disk('academic')->delete($file->object_key);
        $this->assertEmptyLibrary();
    }

    private function upload(): MaterialVersion
    {
        Storage::fake('academic');
        $lesson = Module::whereOfferingId($this->offering->id)->sole();
        $this->actingAs($this->teacher)->post(route('learning.revisions.store', [$this->offering, $lesson]), [
            'title' => 'Lab notes', 'download_allowed' => 1,
            'file' => UploadedFile::fake()->createWithContent('lab.py', "print('lab')"),
        ])->assertSessionHasNoErrors()->assertRedirect();

        return MaterialVersion::whereMaterialId(LearningMaterial::whereTitle('Lab notes')->sole()->id)->sole();
    }

    private function assertEmptyLibrary(): void
    {
        $this->get('/student/downloads')->assertInertia(fn (Page $p) => $p->has('materials', 0));
    }
}
