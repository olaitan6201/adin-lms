<?php

namespace Tests\Feature;

use App\Enums\OrganisationAuditAction;
use App\Models\AcademicPathway;
use App\Models\AcademicProgramme;
use App\Models\AuditLog;
use App\Models\Department;
use App\Models\ProgrammeLevel;
use App\Models\Specialization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class StructureRegisterImportTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_mixed_import_resolves_out_of_order_parents_and_only_audits_creates(): void
    {
        $actor = $this->academicUser();
        $department = Department::factory()->create(['code' => 'SCI']);
        $existing = AcademicProgramme::factory()->create(['code' => 'EX', 'name' => 'Existing']);
        $csv = "pathways,,,SCI,CS,AI,\nprogramme-levels,FIRST,First,,CS,,1\nspecializations,AI,Intelligence,SCI,,,\nshared-programmes,CS,Computing,,,,\nshared-programmes,EX,Existing,,,,";
        $preview = $this->postJson('/admin/structure/register/import/preview', $this->payload($csv));
        $preview->assertOk()->assertHeader('Cache-Control', 'no-store, private')
            ->assertJsonPath('created', 4)->assertJsonPath('skipped', 1)
            ->assertJsonFragment(['line' => 2, 'kind' => 'pathways', 'code' => '', 'name' => '', 'parent' => 'SCI / AI / CS', 'existing' => false]);
        foreach ($preview->json('rows') as $row) {
            $fields = ['line', 'kind', 'code', 'name', 'parent', 'existing'];
            if ($row['kind'] === 'programme-levels') {
                $fields[] = 'position';
                $this->assertSame(1, $row['position']);
            }
            $this->assertSame($fields, array_keys($row));
        }
        $this->assertDatabaseCount('academic_programmes', 1);
        $this->assertDatabaseCount('academic_pathways', 0);
        $this->assertDatabaseMissing('audit_logs', ['action' => OrganisationAuditAction::Imported->value]);

        $this->postJson('/admin/structure/register/import', $this->payload($csv) + ['confirmation' => $preview->json('confirmation')])
            ->assertOk()->assertHeader('Cache-Control', 'no-store, private')->assertExactJson(['created' => 4]);

        $pathway = AcademicPathway::query()->sole();
        $programme = AcademicProgramme::query()->where('code', 'CS')->sole();
        $level = ProgrammeLevel::query()->sole();
        $specialization = Specialization::query()->sole();
        $this->assertSame($department->id, $specialization->department_id);
        $this->assertSame([$programme->id, 'First', 1], [$level->academic_programme_id, $level->label, $level->position]);
        $this->assertSame([$specialization->id, $programme->id], [$pathway->specialization_id, $pathway->academic_programme_id]);
        $this->assertSame(1, $existing->fresh()->revision_number);
        $audits = AuditLog::query()->where('action', OrganisationAuditAction::Imported->value)->get()->keyBy('subject_key');
        $this->assertCount(4, $audits);
        foreach ([2 => $pathway, 3 => $level, 4 => $specialization, 5 => $programme] as $line => $record) {
            $this->assertTrue(Str::isUuid($record->id, 7));
            $audit = $audits[$record->getTable().':'.$record->id];
            $this->assertSame($actor->id, $audit->actor_id);
            $this->assertSame($line, $audit->details['row']);
        }
        $this->postJson('/admin/structure/register/import/preview', $this->payload($csv))
            ->assertOk()->assertJsonPath('skipped', 5);
    }

    public function test_preview_rejects_conflicts_duplicates_bad_fields_and_wrong_parent_scope(): void
    {
        $this->academicUser();
        $science = Department::factory()->create(['code' => 'SCI']);
        Department::factory()->create(['code' => 'ART']);
        Specialization::factory()->create(['department_id' => $science->id, 'code' => 'AI']);
        AcademicProgramme::factory()->create(['code' => 'EX', 'name' => 'Existing']);
        $csv = implode("\n", [
            'shared-programmes,EX,Changed,,,,',
            'shared-programmes,NEW,New,,,,',
            'shared-programmes,NEW,New,,,,',
            'programme-levels,L,First,,EX,,0',
            'pathways,UNWANTED,,SCI,EX,AI,',
            'pathways,,,ART,EX,AI,',
            'specializations,GONE,Gone,INVALID,,,',
            'programme-levels,X,Unknown,,MISSING,,1',
        ]);

        $preview = $this->postJson('/admin/structure/register/import/preview', $this->payload($csv));
        $preview->assertOk()->assertJsonPath('confirmation', null);
        $this->assertSame([2, 4, 5, 6, 7, 8, 9], array_keys($preview->json('errors')));
        $this->postJson('/admin/structure/register/import', $this->payload($csv) + ['confirmation' => str_repeat('0', 64)])
            ->assertUnprocessable()->assertJsonValidationErrors('confirmation');
        $this->assertDatabaseCount('academic_programmes', 1);
        $this->assertDatabaseCount('programme_levels', 0);
        $this->assertDatabaseCount('academic_pathways', 0);
        $this->assertDatabaseMissing('audit_logs', ['action' => OrganisationAuditAction::Imported->value]);
    }

    public function test_preview_respects_code_collation_within_but_not_across_parent_scopes(): void
    {
        $this->academicUser();
        Department::factory()->create(['code' => 'SCI']);
        Department::factory()->create(['code' => 'ART']);
        $csv = "specializations,ECO,One,SCI,,,\nspecializations,ÉCO,Two,SCI,,,\nspecializations,ECO,Three,ART,,,";
        $response = $this->postJson('/admin/structure/register/import/preview', $this->payload($csv))->assertOk();
        if (DB::connection()->getDriverName() === 'mysql') {
            $response->assertJsonPath('created', 2)->assertJsonPath('confirmation', null)->assertJsonStructure(['errors' => ['3']]);
        } else {
            $response->assertJsonPath('created', 3)->assertJsonPath('errors', []);
        }
        $this->assertDatabaseCount('specializations', 0);
    }

    public function test_template_mapping_and_one_sheet_workbook_match_the_wire_contract(): void
    {
        $this->academicUser();
        $response = $this->get(route('admin.structure.register.import.template'));
        $response->assertOk()->assertDownload('academic-structure-register-template.csv')->assertHeader('Cache-Control', 'no-store, private');
        $this->assertStringStartsWith(implode(',', $this->fields())."\n", $response->streamedContent());
        $book = new Spreadsheet;
        $book->getActiveSheet()->fromArray([$this->fields(), ['shared-programmes', 'CS', 'Computing']]);
        $file = UploadedFile::fake()->create('register.xlsx');
        (new Xlsx($book))->save($file->getPathname());
        $book->disconnectWorksheets();
        $this->postJson(route('admin.structure.register.import.columns'), ['file' => $file])
            ->assertOk()->assertHeader('Cache-Control', 'no-store, private')->assertExactJson(['headers' => $this->fields()]);
        $this->postJson(route('admin.structure.register.import.preview'), [
            'file' => $file,
            'columns' => array_flip($this->fields()),
        ])->assertOk()->assertJsonPath('created', 1);
        $payload = $this->payload('shared-programmes,CS,Computing,,,,');
        $payload['columns']['position'] = 0;
        $this->postJson(route('admin.structure.register.import.preview'), $payload)
            ->assertUnprocessable()->assertJsonValidationErrors('columns');
    }

    private function fields(): array
    {
        return ['kind', 'code', 'name', 'department_code', 'programme_code', 'specialization_code', 'position'];
    }

    private function payload(string $rows): array
    {
        return [
            'file' => UploadedFile::fake()->createWithContent('register.csv', implode(',', $this->fields())."\n".$rows."\n"),
            'columns' => array_flip($this->fields()),
        ];
    }
}
