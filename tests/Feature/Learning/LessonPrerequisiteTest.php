<?php

namespace Tests\Feature\Learning;

use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Page;

class LessonPrerequisiteTest extends LearningTestCase
{
    public function test_only_the_learners_own_completion_unlocks_reading_files_and_completion(): void
    {
        Storage::fake('local');
        $prior = Module::whereOfferingId($this->offering->id)->sole();
        $payload = ['title' => 'Fieldwork', 'position' => 2, 'kind' => 'chapter', 'published' => 1,
            'body' => 'Private field notes.', 'prerequisite_id' => $prior->id];
        $this->actingAs($this->teacher)->post($this->base.'/lessons', $payload)->assertSessionHasNoErrors();
        $lesson = Module::whereTitle('Fieldwork')->sole();
        $this->assertSame($prior->id, $lesson->prerequisite_id);
        $this->post(route('learning.revisions.store', [$this->offering, $lesson]), [
            'title' => 'Field appendix', 'download_allowed' => 1,
            'file' => UploadedFile::fake()->createWithContent('field.py', "print('notes')"),
        ])->assertSessionHasNoErrors();
        $material = LearningMaterial::whereTitle('Field appendix')->sole();
        $version = MaterialVersion::whereMaterialId($material->id)->sole();
        $file = route('learning.download', [$this->offering, $version]);
        $this->schedule('Field seminar')->forceFill(['recording_material_id' => $material->id])->save();
        $this->assertDatabaseMissing('notifications', ['recipient_id' => $this->learner->id, 'event_key' => 'material:'.$version->id]);
        $other = User::whereEmail('tunde@demo.example.test')->sole();
        $this->actingAs($other)->post(route('learning.complete', [$this->offering, $prior]))->assertRedirect();

        $this->actingAs($this->learner)->get($this->base)->assertInertia(fn (Page $p) => $p
            ->where('lessons.1.title', 'Fieldwork')->where('lessons.1.locked', true)
            ->where('lessons.1.prerequisite_id', $prior->id)->where('lessons.1.body', null)->has('lessons.1.materials', 0));
        $this->get(route('courses.show', $this->offering))->assertInertia(fn (Page $p) => $p
            ->where('activities.1.readingPreview', null)->where('activities.1.detail', 'Complete the prerequisite lesson first'));
        $this->get(route('learning.classes', $this->offering))->assertInertia(fn (Page $p) => $p->where('sessions.0.recording_material_id', null));
        $this->get($file)->assertNotFound();
        $this->get('/reports?offering='.$this->offering->id)->assertOk()->assertDontSee('Field appendix');
        $this->post(route('learning.complete', [$this->offering, $lesson]))->assertNotFound();
        $this->assertDatabaseMissing('lesson_progress', ['module_id' => $lesson->id]);
        $this->post(route('learning.complete', [$this->offering, $prior]))->assertRedirect();
        $this->get($this->base)->assertInertia(fn (Page $p) => $p->where('lessons.1.locked', false)
            ->where('lessons.1.body', 'Private field notes.')->has('lessons.1.materials', 1));
        $this->get($file)->assertDownload('field.py');
        $this->get('/reports?offering='.$this->offering->id)->assertOk()->assertSee('Field appendix');
        $this->post(route('learning.complete', [$this->offering, $lesson]))->assertRedirect();
        $this->assertDatabaseHas('lesson_progress', ['module_id' => $lesson->id]);
    }

    public function test_dependencies_stay_inside_the_course_and_point_backwards_after_edits(): void
    {
        $prior = Module::whereOfferingId($this->offering->id)->sole();
        $other = Module::where('offering_id', '!=', $this->offering->id)->firstOrFail();
        $data = ['title' => 'Second', 'kind' => 'chapter', 'position' => 2, 'published' => 1];
        $url = $this->base.'/lessons';
        $this->actingAs($this->teacher)->post($url, $data + ['prerequisite_id' => $other->id])->assertSessionHasErrors('prerequisite_id');
        $this->post($url, $data + ['prerequisite_id' => $prior->id])->assertSessionHasNoErrors();
        $next = Module::whereTitle('Second')->sole();
        $this->post("$url/$next->id", $data + ['prerequisite_id' => $next->id])->assertSessionHasErrors('prerequisite_id');
        $this->post("$url/$prior->id", ['position' => 3] + $data)->assertSessionHasErrors('position');
        $this->post("$url/$next->id", $data + ['prerequisite_id' => null])->assertSessionHasNoErrors();
        $this->assertNull($next->fresh()->prerequisite_id);
    }
}
