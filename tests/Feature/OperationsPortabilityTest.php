<?php

namespace Tests\Feature;

use App\Enums\RoleCode;
use App\Models\LearningMaterial;
use App\Models\MaterialVersion;
use App\Models\Module;
use App\Models\Offering;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\OperationsAccess;
use Tests\TestCase;
use ZipArchive;

class OperationsPortabilityTest extends TestCase
{
    use OperationsAccess, RefreshDatabase;

    public static function formats(): array
    {
        return [
            'SCORM 1.2 text asset' => ['scorm', 'imsmanifest.xml', 'Water & soils'],
            'Adin native chapters' => ['native', 'course.json', 'Field methods'],
        ];
    }

    #[DataProvider('formats')]
    public function test_import_export_reimport_preserves_content_and_link_targets(string $format, string $manifest, string $title): void
    {
        $this->operator(RoleCode::InstitutionalAdmin);
        $source = Offering::factory()->create();
        $target = Offering::factory()->create();
        $url = "/operations/courses/{$source->id}";
        $body = $this->fixture('field.txt');
        $file = $this->archive([$manifest => $this->fixture($manifest), 'field.txt' => $body]);
        $this->postJson("$url/import", ['package' => $file])->assertCreated()->assertJsonPath('imported', 1);
        $this->postJson("$url/import", ['package' => $file])->assertConflict();
        $download = $this->get("$url/export/$format")->assertOk()->assertHeader('Content-Type', 'application/zip');
        $second = UploadedFile::fake()->createWithContent('roundtrip.zip', $download->getContent());
        $this->postJson("/operations/courses/{$target->id}/import", ['package' => $second])->assertCreated();
        $module = Module::where('offering_id', $target->id)->sole();
        $this->assertSame([$title, $body, 1], [$module->title, $module->body, $module->position]);
        if ($format === 'native') {
            $link = LearningMaterial::where('module_id', $module->id)->sole();
            $this->assertSame('Library catalogue', $link->title);
            $this->assertSame('https://library.example.test/catalogue', MaterialVersion::where('material_id', $link->id)->sole()->external_url);
            $this->getJson("$url/export/scorm")->assertUnprocessable();
        }

        $this->assertDatabaseCount('enrolments', 0);
        $this->assertDatabaseHas('audit_logs', ['action' => 'course.exported', 'subject_key' => $source->id]);
    }

    public function test_import_and_export_require_course_exchange_authority(): void
    {
        $source = Offering::factory()->create();
        $url = "/operations/courses/{$source->id}";
        $this->actingAs(User::factory()->create())->postJson("$url/import")->assertForbidden();
        $this->getJson("$url/export/native")->assertForbidden();
        $this->operator(RoleCode::IctAdmin);
        $this->getJson("$url/export/native")->assertForbidden();
    }

    public function test_invalid_packages_leave_the_target_unchanged(): void
    {
        $source = Offering::factory()->create();
        $url = "/operations/courses/{$source->id}";
        $this->operator(RoleCode::InstitutionalAdmin);
        $manifest = $this->fixture('imsmanifest.xml');
        foreach ([
            ['imsmanifest.xml' => $manifest],
            ['imsmanifest.xml' => $manifest, 'field.txt' => 'lesson', '../extra.txt' => 'invalid'],
            ['imsmanifest.xml' => str_replace('"asset"', '"sco"', $manifest), 'field.txt' => 'lesson'],
            ['imsmanifest.xml' => '<!DOCTYPE manifest>'.$manifest, 'field.txt' => 'lesson'],
            ['course.json' => $this->fixture('course.json'), 'field.txt' => str_repeat('a', 65536)],
        ] as $entries) {
            $this->postJson("$url/import", ['package' => $this->archive($entries)])
                ->assertUnprocessable()
                ->assertJsonValidationErrors('package');
        }

        $this->assertDatabaseCount('modules', 0);
        $this->assertDatabaseMissing('audit_logs', ['action' => 'course.imported']);
    }

    private function fixture(string $name): string
    {
        return file_get_contents(base_path('tests/Fixtures/operations/'.$name));
    }

    public function test_cartridge_text_resource_maps_to_chapter_in_reading_order(): void
    {
        $target = Offering::factory()->create();
        $this->operator(RoleCode::InstitutionalAdmin);
        $package = $this->archive(['imsmanifest.xml' => $this->fixture('cartridge11.xml'), 'web_resources/Reading.txt' => 'Read the field notes.']);
        $this->postJson("/operations/courses/{$target->id}/import", ['package' => $package])->assertCreated();
        $this->assertDatabaseHas('modules', ['offering_id' => $target->id, 'position' => 1, 'title' => 'Soil observations', 'body' => 'Read the field notes.']);
    }

    private function archive(array $entries): UploadedFile
    {
        $file = tmpfile();
        try {
            $path = stream_get_meta_data($file)['uri'];
            $zip = new ZipArchive;
            $zip->open($path, ZipArchive::OVERWRITE);
            foreach ($entries as $name => $body) {
                $zip->addFromString($name, $body);
            }

            $zip->close();

            return UploadedFile::fake()->createWithContent('sample.zip', file_get_contents($path));
        } finally {
            fclose($file);
        }
    }
}
