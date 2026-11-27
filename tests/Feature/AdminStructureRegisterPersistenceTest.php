<?php

namespace Tests\Feature;

use App\Enums\OperationsEvent;
use App\Enums\OrganisationAuditAction;
use App\Enums\StructureRegisterStatus;
use App\Models\AcademicPathway;
use App\Models\AcademicProgramme;
use App\Models\AuditLog;
use App\Models\Department;
use App\Models\ProgrammeLevel;
use App\Models\Specialization;
use App\Services\Operations\OperationsAudit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class AdminStructureRegisterPersistenceTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_register_creates_have_generated_ids_and_server_owned_timestamps(): void
    {
        $this->academicUser();
        $department = Department::factory()->create();
        $postedId = (string) Str::uuid7();
        $extra = [
            'id' => $postedId, 'status' => 'archived', 'revision_number' => 99,
            'created_at' => '2000-01-01', 'updated_at' => '2000-01-01',
        ];
        $this->travelTo(Carbon::parse('2030-05-14 10:30:00'));

        $this->post(route('admin.structure.register.store', 'shared-programmes'), [
            'code' => 'UG', 'name' => 'Undergraduate',
        ] + $extra)->assertRedirectToRoute('admin.structure');
        $programme = AcademicProgramme::query()->sole();
        $this->post(route('admin.structure.register.store', 'programme-levels'), [
            'academic_programme_id' => $programme->id, 'code' => '100', 'label' => 'Year one', 'position' => 1,
        ] + $extra)->assertRedirectToRoute('admin.structure');
        $this->post(route('admin.structure.register.store', 'specializations'), [
            'department_id' => $department->id, 'code' => 'SE', 'name' => 'Software Engineering',
        ] + $extra)->assertRedirectToRoute('admin.structure');
        $track = Specialization::query()->sole();
        $this->post(route('admin.structure.register.store', 'pathways'), [
            'academic_programme_id' => $programme->id, 'specialization_id' => $track->id,
        ] + $extra)->assertRedirectToRoute('admin.structure');
        $pathway = AcademicPathway::query()->sole();

        $level = $programme->levels()->sole();
        foreach ([$programme, $level, $track, $pathway] as $record) {
            $this->assertTrue(Str::isUuid($record->id, 7));
            $this->assertNotSame($postedId, $record->id);
            $this->assertEquals(now(), $record->created_at);
            $this->assertEquals(now(), $record->updated_at);
            $audit = AuditLog::query()->where('subject_key', $record->getTable().':'.$record->id)->sole();
            $this->assertSame(OrganisationAuditAction::Created, $audit->organisation_action);
            $this->assertSame('organisation.created', $audit->getRawOriginal('action'));
            $this->assertSame('organisation.created', $audit->toArray()['action']);
            $this->assertArrayNotHasKey('organisation_action', $audit->toArray());
        }

        foreach ([$programme, $track, $pathway] as $record) {
            $this->assertSame(StructureRegisterStatus::Active, $record->status);
            $this->assertSame('active', $record->getRawOriginal('status'));
            $this->assertSame('active', $record->toArray()['status']);
        }

        foreach ([$programme, $level, $track] as $record) {
            $this->assertSame(1, $record->revision_number);
        }
    }

    public function test_correction_uses_current_update_time_without_inventing_a_historical_creation_time(): void
    {
        $this->academicUser();
        $programme = AcademicProgramme::factory()->create();
        $level = [
            'id' => (string) Str::uuid7(), 'academic_programme_id' => $programme->id,
            'code' => '100', 'label' => 'First year', 'position' => 1,
        ];
        DB::table('programme_levels')->insert($level);
        $before = ProgrammeLevel::query()->sole();
        $this->assertNull($before->created_at);
        $this->assertNull($before->updated_at);

        $revision = $this->get(route('admin.structure'))->assertOk()->viewData('page')['props']['register']['levels'][0]['revision'];
        $this->travelTo(Carbon::parse('2030-05-15 10:30:00'));
        $this->patch(route('admin.structure.register.update', ['programme-levels', $level['id']]), array_replace($level, [
            'revision' => $revision,
            'id' => (string) Str::uuid7(),
            'label' => 'Year one',
            'created_at' => '2000-01-01',
            'updated_at' => '2000-01-01',
        ]))->assertSessionHasNoErrors()->assertRedirectToRoute('admin.structure');

        $after = $before->fresh();
        $this->assertSame($level['id'], $after->id);
        $this->assertSame($programme->id, $after->academic_programme_id);
        $this->assertSame('Year one', $after->label);
        $this->assertNull($after->created_at);
        $this->assertEquals(now(), $after->updated_at);
    }

    public function test_unrelated_audit_producer_keeps_its_string_action(): void
    {
        $actor = $this->academicUser();
        $event = OperationsAudit::record($actor, OperationsEvent::BrandingChanged, 'institution:branding')->refresh();

        $this->assertNull($event->organisation_action);
        $this->assertSame('operations.branding_changed', $event->action);
        $this->assertSame('operations.branding_changed', $event->getRawOriginal('action'));
        $this->assertSame('operations.branding_changed', $event->toArray()['action']);
    }

    public function test_register_models_allow_only_their_business_attributes_for_mass_assignment(): void
    {
        $expected = [
            AcademicProgramme::class => ['code', 'name'],
            ProgrammeLevel::class => ['academic_programme_id', 'code', 'label', 'position'],
            Specialization::class => ['department_id', 'code', 'name'],
            AcademicPathway::class => ['specialization_id', 'academic_programme_id'],
        ];
        foreach ($expected as $class => $fields) {
            $model = new $class;
            $this->assertSame($fields, $model->getFillable());
            foreach (['id', 'created_at', 'updated_at', 'status', 'revision_number'] as $protected) {
                $this->assertFalse($model->isFillable($protected));
            }
        }
    }
}
