<?php

namespace Tests\Feature;

use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Services\Operations\TextAssetArchive;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Tests\Support\OperationsAccess;
use Tests\TestCase;

class NativeMaterialReferencesTest extends TestCase
{
    use OperationsAccess, RefreshDatabase;

    public function test_export_references_follow_materials_even_if_the_archive_rows_are_reordered(): void
    {
        $this->operator();
        $source = Offering::factory()->create();
        $lesson = Module::factory()->create(['offering_id' => $source->id]);
        $ids = [];
        foreach (['Map', 'Key'] as $title) {
            $material = LearningMaterial::factory()->create(['module_id' => $lesson->id, 'title' => $title]);
            MaterialVersion::factory()->create(['material_id' => $material->id]);
            $ids[$title] = $material->id;
        }
        $body = "Find {{resource:{$ids['Key']}}}\n\n{{resource:{$ids['Map']}}}";
        $lesson->forceFill(['body' => $body])->save();
        $download = $this->get("/operations/courses/$source->id/export/native")->assertOk()->getContent();
        $archive = UploadedFile::fake()->createWithContent('course.zip', $download);
        $json = TextAssetArchive::read($archive->getPathname())['backup.json'];
        foreach ([$lesson->id, $source->id, ...array_values($ids)] as $id) {
            $this->assertStringNotContainsString($id, $json);
        }
        $manifest = json_decode($json, true, flags: JSON_THROW_ON_ERROR);
        $manifest['lessons'][0]['materials'] = array_reverse($manifest['lessons'][0]['materials']);
        $target = Offering::factory()->create();
        $this->postJson("/operations/courses/$target->id/import", ['package' => $this->archive($manifest)])->assertCreated();
        $copy = Module::whereOfferingId($target->id)->sole();
        $new = LearningMaterial::whereModuleId($copy->id)->pluck('id', 'title');
        $this->assertSame("Find {{resource:{$new['Key']}}}\n\n{{resource:{$new['Map']}}}", $copy->body);
        $lesson->forceFill(['body' => '{{resource:'.$new['Map'].'}}'])->save();
        $this->getJson("/operations/courses/$source->id/export/native")->assertUnprocessable()->assertJsonValidationErrors('package');
    }

    public function test_older_lesson_restores_only_when_inline_mapping_is_not_required(): void
    {
        $this->operator();
        $target = Offering::factory()->create();
        $lesson = ['title' => 'Reading', 'kind' => 'chapter', 'body' => '{{resource:'.Str::uuid7().'}}', 'materials' => []];
        $manifest = ['format' => 'adin-course-2', 'forums' => [], 'lessons' => [$lesson]];
        $this->postJson("/operations/courses/$target->id/import", ['package' => $this->archive($manifest)])
            ->assertUnprocessable()->assertJsonPath('errors.package.0', 'This older backup has inline resource markers without a mapping. Export the source course again.');
        $this->assertDatabaseCount('modules', 0);
        $manifest['lessons'][0]['body'] = 'Ordinary older text.';
        $this->postJson("/operations/courses/$target->id/import", ['package' => $this->archive($manifest)])->assertCreated();
        $this->assertSame('Ordinary older text.', Module::whereOfferingId($target->id)->sole()->body);
    }

    public function test_ambiguous_or_foreign_references_are_rejected_before_persistence(): void
    {
        $this->operator();
        $target = Offering::factory()->create();
        $id = (string) Str::uuid();
        $row = ['ref' => $id, 'title' => 'Map', 'body' => 'A map', 'download' => true, 'transcript' => null, 'url' => null, 'attachment' => null];
        $lesson = ['title' => 'Reading', 'kind' => 'chapter', 'body' => '{{resource:'.$id.'}}', 'materials' => [$row]];
        foreach ([
            [array_merge($lesson, ['materials' => [$row, $row]])],
            [$lesson, array_merge($lesson, ['materials' => []])],
            [array_merge($lesson, ['materials' => [array_merge($row, ['ref' => ['invalid']])]])],
        ] as $lessons) {
            $manifest = ['format' => 'adin-course-4', 'forums' => [], 'lessons' => $lessons];
            $this->postJson("/operations/courses/$target->id/import", ['package' => $this->archive($manifest)])
                ->assertUnprocessable()->assertJsonValidationErrors('package');
            $this->assertDatabaseCount('modules', 0);
            $this->assertDatabaseCount('learning_materials', 0);
        }
    }

    private function archive(array $manifest): UploadedFile
    {
        $bytes = TextAssetArchive::write(['backup.json' => json_encode($manifest, JSON_THROW_ON_ERROR)]);

        return UploadedFile::fake()->createWithContent('course.zip', $bytes);
    }
}
