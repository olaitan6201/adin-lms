<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Faculty;
use App\Models\Programme;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Exception as SpreadsheetException;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx as XlsxWriter;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class StructureImportTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_preview_does_not_write_and_confirmation_resolves_parents_in_any_row_order(): void
    {
        $actor = $this->academicUser();
        $csv = "Identifier,Parent,Label,Kind\nBSC,COMP,BSc Computing,programme\nCOMP,SCI,Computing,department\nSCI,,Science,faculty\n";
        $preview = $this->postJson('/admin/structure/import/preview', $this->payload($csv));
        $preview->assertOk()->assertHeader('Cache-Control', 'no-store, private')
            ->assertJsonPath('created', 3)->assertJsonPath('skipped', 0)
            ->assertJsonPath('rows.0.code', 'SCI')
            ->assertJsonMissingPath('rows.0.id');
        $this->assertDatabaseMissing('faculties', ['code' => 'SCI']);

        $this->postJson('/admin/structure/import', $this->payload($csv) + [
            'confirmation' => $preview->json('confirmation'),
        ])->assertOk()->assertJsonPath('created', 3);

        $programme = Programme::query()->with('department.faculty')->sole();
        $department = $programme->department;
        $faculty = $department->faculty;
        $this->assertSame(['BSC', 'COMP', 'SCI'], [$programme->code, $department->code, $faculty->code]);
        $subjects = [
            'programmes:'.$programme->id => ['code' => 'BSC', 'row' => 2],
            'departments:'.$department->id => ['code' => 'COMP', 'row' => 3],
            'faculties:'.$faculty->id => ['code' => 'SCI', 'row' => 4],
        ];
        foreach ([$programme, $department, $faculty] as $record) {
            $this->assertTrue(Str::isUuid($record->id, 7));
        }
        $audits = AuditLog::query()->where('actor_id', $actor->id)->where('action', 'organisation.imported')->get();
        $this->assertCount(3, $audits);
        $details = $audits->pluck('details', 'subject_key')->map(fn (array $row): array => collect($row)->sortKeys()->all());
        $this->assertSame(collect($subjects)->sortKeys()->all(), $details->sortKeys()->all());
        $this->postJson('/admin/structure/import/preview', $this->payload($csv))
            ->assertOk()
            ->assertJsonPath('skipped', 3);
    }

    public function test_preview_reports_errors_by_source_row_and_prevents_confirmation(): void
    {
        $this->academicUser();
        $csv = "Identifier,Parent,Label,Kind\nSCI,,Science,faculty\nCOMP,MISSING,Computing,department\n";
        $this->postJson('/admin/structure/import/preview', $this->payload($csv))
            ->assertOk()
            ->assertJsonPath('errors.3', 'Parent code was not found.')
            ->assertJsonPath('confirmation', null);
        $this->assertDatabaseMissing('faculties', ['code' => 'SCI']);

        $this->postJson('/admin/structure/import', $this->payload($csv) + ['confirmation' => str_repeat('0', 64)])
            ->assertUnprocessable();
        $this->assertDatabaseMissing('faculties', ['code' => 'SCI']);
    }

    public function test_guests_and_unauthorised_users_cannot_submit_an_import(): void
    {
        $this->postJson('/admin/structure/import/preview')->assertUnauthorized();
        $this->academicUser('examination_officer');
        $this->postJson('/admin/structure/import/preview')->assertForbidden();
        $this->postJson('/admin/structure/import')->assertForbidden();
    }

    public function test_authorised_user_can_download_the_template_and_read_upload_headers(): void
    {
        $this->academicUser();
        $this->get('/admin/structure/import/template')
            ->assertOk()
            ->assertDownload('academic-structure-template.csv');
        $payload = $this->payload("Identifier,Parent,Label,Kind\nSCI,,Science,faculty\n");
        $this->postJson('/admin/structure/import/columns', ['file' => $payload['file']])
            ->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertJsonPath('headers', ['Identifier', 'Parent', 'Label', 'Kind']);
        $this->assertDatabaseMissing('faculties', ['code' => 'SCI']);
    }

    public function test_confirmation_cannot_be_used_after_a_conflicting_write(): void
    {
        $this->academicUser();
        $csv = "Identifier,Parent,Label,Kind\nSCI,,Science,faculty\nCOMP,SCI,Computing,department\n";
        $preview = $this->postJson('/admin/structure/import/preview', $this->payload($csv));
        $preview->assertOk();
        Faculty::factory()->create(['code' => 'SCI', 'name' => 'Existing']);

        $this->postJson('/admin/structure/import', $this->payload($csv) + [
            'confirmation' => $preview->json('confirmation'),
        ])->assertUnprocessable()->assertJsonValidationErrors('confirmation');

        $this->assertDatabaseHas('faculties', ['code' => 'SCI', 'name' => 'Existing']);
        $this->assertDatabaseMissing('departments', ['code' => 'COMP']);
    }

    public function test_malformed_workbook_returns_file_validation_without_writing_records(): void
    {
        $this->academicUser();
        $this->postJson('/admin/structure/import/columns', [
            'file' => UploadedFile::fake()->createWithContent('structure.xlsx', 'not a workbook'),
        ])->assertUnprocessable()->assertJsonValidationErrors('file');
        $this->assertDatabaseCount('faculties', 0);
        $this->assertDatabaseMissing('audit_logs', ['action' => 'organisation.imported']);
    }

    public function test_preview_respects_the_database_code_equivalence(): void
    {
        $this->academicUser();
        $response = $this->postJson('/admin/structure/import/preview', $this->payload(
            "Identifier,Parent,Label,Kind\nECO,,Economics,faculty\nÉCO,,Other,faculty\n",
        ));
        $response->assertOk();
        if (DB::connection()->getDriverName() === 'mysql') {
            $response->assertJsonPath('errors.3', 'The code appears more than once for this kind.')
                ->assertJsonPath('confirmation', null);
        } else {
            $response->assertJsonPath('created', 2);
        }
        $this->assertDatabaseCount('faculties', 0);
    }

    public function test_workbook_parser_exceptions_return_file_validation(): void
    {
        $this->academicUser();
        $file = UploadedFile::fake()->create('structure.xlsx');
        $book = new Spreadsheet;
        $book->getActiveSheet()->fromArray([['kind', 'code', 'name', 'parent_code'], ['faculty', 'SCI', 'Science', '']]);
        (new XlsxWriter($book))->save($file->getPathname());
        $book->disconnectWorksheets();
        $reader = $this->createMock(Xlsx::class);
        $reader->expects($this->once())->method('listWorksheetInfo')
            ->willThrowException(new SpreadsheetException('Invalid worksheet metadata'));
        $this->app->instance(Xlsx::class, $reader);

        $this->postJson('/admin/structure/import/columns', ['file' => $file])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
        $this->assertDatabaseCount('faculties', 0);
        $this->assertDatabaseMissing('audit_logs', ['action' => 'organisation.imported']);
    }

    private function payload(string $csv): array
    {
        return [
            'file' => UploadedFile::fake()->createWithContent('structure.csv', $csv),
            'columns' => ['code' => 0, 'parent_code' => 1, 'name' => 2, 'kind' => 3],
        ];
    }
}
