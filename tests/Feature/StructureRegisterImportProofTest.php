<?php

namespace Tests\Feature;

use App\Enums\OrganisationAuditAction;
use App\Models\AcademicProgramme;
use App\Services\Academics\StructureRegister;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class StructureRegisterImportProofTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_every_endpoint_uses_the_institutional_gate(): void
    {
        $endpoints = ['GET' => ['/template'], 'POST' => ['/columns', '/preview', '']];
        foreach ($endpoints as $method => $suffixes) {
            foreach ($suffixes as $suffix) {
                $this->json($method, '/admin/structure/register/import'.$suffix)->assertUnauthorized();
            }
        }
        $this->academicUser('ict_admin');
        foreach ($endpoints as $method => $suffixes) {
            foreach ($suffixes as $suffix) {
                $this->json($method, '/admin/structure/register/import'.$suffix)->assertForbidden();
            }
        }
        $this->assertDatabaseCount('academic_programmes', 0);
    }

    public function test_proof_binds_upload_mapping_session_and_actor_and_cannot_create_twice(): void
    {
        $actor = $this->academicUser();
        $path = '/admin/structure/register/import';
        $proof = $this->postJson($path.'/preview', $this->payload())->assertOk()->json('confirmation');
        $this->postJson($path, $this->payload('Edited') + ['confirmation' => $proof])->assertUnprocessable()->assertJsonValidationErrors('confirmation');
        $mapped = $this->payload();
        [$mapped['columns']['department_code'], $mapped['columns']['position']] = [6, 3];
        $this->postJson($path, $mapped + ['confirmation' => $proof])->assertUnprocessable()->assertJsonValidationErrors('confirmation');
        $session = session()->token();
        $this->withSession(['_token' => 'new-session'])
            ->postJson($path, $this->payload() + ['confirmation' => $proof])->assertUnprocessable()->assertJsonValidationErrors('confirmation');
        $this->academicUser();
        $this->withSession(['_token' => $session])
            ->postJson($path, $this->payload() + ['confirmation' => $proof])->assertUnprocessable()->assertJsonValidationErrors('confirmation');
        $this->assertDatabaseCount('academic_programmes', 0);

        $this->actingAs($actor)->withSession(['security.mfa_user' => $actor->id, '_token' => $session])
            ->postJson($path, $this->payload() + ['confirmation' => $proof])->assertOk()->assertExactJson(['created' => 1]);
        $this->postJson($path, $this->payload() + ['confirmation' => $proof])->assertUnprocessable()->assertJsonValidationErrors('confirmation');
        $this->assertDatabaseCount('academic_programmes', 1);
    }

    public function test_an_existing_parent_correction_requires_new_preview_even_with_its_code_unchanged(): void
    {
        $this->academicUser();
        $path = '/admin/structure/register/import';
        $parent = AcademicProgramme::factory()->create(['code' => 'PARENT', 'name' => 'Parent']);
        $body = "shared-programmes,CS,Computing,,,,\nprogramme-levels,L,First,,PARENT,,1";
        $proof = $this->postJson($path.'/preview', $this->payload(rows: $body))->assertOk()->json('confirmation');
        $this->patchJson(route('admin.structure.register.update', ['kind' => 'shared-programmes', 'record' => $parent->id]), [
            'code' => $parent->code,
            'name' => $parent->name,
            'revision' => StructureRegister::revision($parent->fresh()),
        ])->assertRedirect();
        $this->assertSame(2, $parent->fresh()->revision_number);

        $this->postJson($path, $this->payload(rows: $body) + ['confirmation' => $proof])
            ->assertUnprocessable()->assertJsonValidationErrors('confirmation');
        $this->assertDatabaseMissing('academic_programmes', ['code' => 'CS']);
        $this->assertDatabaseCount('programme_levels', 0);
        $this->assertDatabaseMissing('audit_logs', ['action' => OrganisationAuditAction::Imported->value]);
    }

    public function test_an_exact_insert_after_preview_is_not_silently_skipped_at_confirmation(): void
    {
        $this->academicUser();
        $path = '/admin/structure/register/import';
        $proof = $this->postJson($path.'/preview', $this->payload())->assertOk()->json('confirmation');
        AcademicProgramme::factory()->create(['code' => 'CS', 'name' => 'Computing']);
        $this->postJson($path, $this->payload() + ['confirmation' => $proof])
            ->assertUnprocessable()->assertJsonValidationErrors('confirmation');
        $this->assertDatabaseCount('academic_programmes', 1);
        $this->assertDatabaseMissing('audit_logs', ['action' => OrganisationAuditAction::Imported->value]);
    }

    public function test_legacy_confirmation_cannot_authorize_a_register_import(): void
    {
        $this->academicUser();
        $payload = $this->payload(rows: 'shared-programmes,CS,Computing,,,,,faculty', extra: ',legacy_kind');
        $legacy = [
            'file' => $payload['file'],
            'columns' => ['kind' => 7, 'code' => 1, 'name' => 2, 'parent_code' => 3],
        ];
        $proof = $this->postJson('/admin/structure/import/preview', $legacy)->assertOk()->json('confirmation');
        $path = '/admin/structure/register/import';
        $this->postJson($path.'/preview', $payload)->assertOk()->assertJsonPath('created', 1);
        $this->postJson($path, $payload + ['confirmation' => $proof])->assertUnprocessable()->assertJsonValidationErrors('confirmation');
        $this->assertDatabaseCount('academic_programmes', 0);
        $this->assertDatabaseCount('faculties', 0);
    }

    public function test_a_conflict_during_insert_rolls_back_an_earlier_create_and_audit(): void
    {
        $this->academicUser();
        $path = '/admin/structure/register/import';
        $payload = $this->payload(rows: "shared-programmes,AA,First,,,,\nshared-programmes,ZZ,Second,,,,");
        $proof = $this->postJson($path.'/preview', $payload)->assertOk()->json('confirmation');
        AcademicProgramme::creating(function (AcademicProgramme $attempt): void {
            if ($attempt->code !== 'ZZ') {
                return;
            }
            $this->assertDatabaseHas('academic_programmes', ['code' => 'AA']);
            $this->assertDatabaseHas('audit_logs', ['action' => OrganisationAuditAction::Imported->value]);
            DB::table('academic_programmes')->insert(['id' => (string) Str::uuid7(), 'code' => 'ZZ', 'name' => 'Taken']);
        });

        $this->postJson($path, $payload + ['confirmation' => $proof])->assertUnprocessable()->assertJsonValidationErrors('confirmation');
        $this->assertDatabaseCount('academic_programmes', 0);
        $this->assertDatabaseMissing('audit_logs', ['action' => OrganisationAuditAction::Imported->value]);
    }

    private function payload(string $name = 'Computing', ?string $rows = null, string $extra = ''): array
    {
        $fields = ['kind', 'code', 'name', 'department_code', 'programme_code', 'specialization_code', 'position'];
        $rows ??= "shared-programmes,CS,$name,,,,";

        return [
            'file' => UploadedFile::fake()->createWithContent('register.csv', implode(',', $fields).$extra."\n".$rows."\n"),
            'columns' => array_flip($fields),
        ];
    }
}
