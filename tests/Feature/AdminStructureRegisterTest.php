<?php

namespace Tests\Feature;

use App\Models\AcademicPathway;
use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Programme;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class AdminStructureRegisterTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_structure_configures_shared_programmes_and_department_tracks_without_rewriting_legacy_records(): void
    {
        $actor = $this->academicUser();
        $department = Department::factory()->create();
        $legacy = Programme::factory()->create(['department_id' => $department->id]);
        $programme = $this->programme('UG');
        $second = $this->programme('PG');
        $track = $this->specialization($department);
        $level = ['academic_programme_id' => $programme, 'code' => '100', 'label' => 'Year 1', 'position' => 1];
        $this->post(route('admin.structure.register.store', 'programme-levels'), $level)->assertRedirectToRoute('admin.structure');
        $this->post(route('admin.structure.register.store', 'programme-levels'), $level)->assertSessionHasErrors('code');
        $this->post(route('admin.structure.register.store', 'programme-levels'), array_replace($level, [
            'academic_programme_id' => $second,
        ]))->assertRedirectToRoute('admin.structure');

        $path = ['specialization_id' => $track, 'academic_programme_id' => $programme];
        $this->post(route('admin.structure.register.store', 'pathways'), $path)->assertRedirectToRoute('admin.structure');
        $this->post(route('admin.structure.register.store', 'pathways'), $path)->assertSessionHasErrors('academic_programme_id');
        $this->post(route('admin.structure.register.store', 'pathways'), array_replace($path, [
            'academic_programme_id' => $second,
        ]))->assertRedirectToRoute('admin.structure');

        $this->assertTrue(Str::isUuid($programme, 7));
        $pathway = AcademicPathway::query()->with(['programme', 'specialization.department'])->where($path)->sole();
        $this->assertSame($department->id, $pathway->specialization->department->id);
        $this->assertSame($programme, $pathway->programme->levels()->sole()->academic_programme_id);
        $this->assertDatabaseHas('programmes', ['id' => $legacy->id, 'department_id' => $department->id]);
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $actor->id, 'subject_key' => 'academic_programmes:'.$programme]);
        $this->get(route('admin.structure'))->assertInertia(fn (AssertableInertia $page) => $page
            ->has('register.programmes', 2)
            ->has('register.levels', 2)
            ->where('register.specializations.0.department_id', $department->id)
            ->has('register.pathways', 2)
            ->missing('register.programmes.0.department_id'));
    }

    public function test_register_correction_cannot_reparent_a_level_or_move_a_department_with_specializations(): void
    {
        $this->academicUser();
        $department = Department::factory()->create();
        $this->specialization($department);
        $programme = $this->programme('UG');
        $other = $this->programme('PG');
        $level = ['academic_programme_id' => $programme, 'code' => '100', 'label' => 'First year', 'position' => 1];
        $this->post(route('admin.structure.register.store', 'programme-levels'), $level)->assertRedirectToRoute('admin.structure');
        $record = DB::table('programme_levels')->sole();
        $level['revision'] = $this->levelRevision();
        $url = route('admin.structure.register.update', ['programme-levels', $record->id]);
        $this->patch($url, array_replace($level, ['academic_programme_id' => $other]))->assertSessionHasErrors('academic_programme_id');
        $this->patch($url, array_replace($level, [
            'academic_programme_id' => strtoupper($programme),
            'label' => 'Year one',
            'position' => '2',
        ]))->assertSessionHasNoErrors()->assertRedirectToRoute('admin.structure');
        $this->assertDatabaseHas('programme_levels', [
            'id' => $record->id, 'academic_programme_id' => $programme, 'label' => 'Year one', 'position' => 2,
        ]);
        $audit = AuditLog::query()->where('subject_key', 'programme_levels:'.$record->id)->where('action', 'organisation.corrected')->sole();
        $this->assertSame(1, $audit->details['before']['position']);
        $this->assertSame(2, $audit->details['after']['position']);
        $this->assertArrayNotHasKey('revision', $audit->details['after']);

        $this->patch(route('admin.structure.update', ['departments', $department->id]), [
            'name' => $department->name,
            'code' => $department->code,
            'faculty_id' => Faculty::factory()->create()->id,
        ])->assertSessionHasErrors('faculty_id');
        $this->assertSame($department->faculty_id, $department->fresh()->faculty_id);
    }

    public function test_stale_or_missing_revisions_cannot_overwrite_a_newer_correction(): void
    {
        $this->academicUser();
        $programme = $this->programme('UG');
        $level = ['academic_programme_id' => $programme, 'code' => '100', 'label' => 'First year', 'position' => 1];
        $this->post(route('admin.structure.register.store', 'programme-levels'), $level)->assertRedirectToRoute('admin.structure');
        $record = DB::table('programme_levels')->sole();
        $url = route('admin.structure.register.update', ['programme-levels', $record->id]);

        $this->patch($url, $level)->assertSessionHasErrors('revision');
        $level['revision'] = $this->levelRevision();
        $this->patch($url, array_replace($level, ['label' => 'Year one']))->assertSessionHasNoErrors();
        $this->patch($url, array_replace($level, ['position' => 2]))->assertSessionHasErrors('revision');

        $this->assertDatabaseHas('programme_levels', ['id' => $record->id, 'label' => 'Year one', 'position' => 1]);
        $this->assertSame(1, AuditLog::query()->where('subject_key', 'programme_levels:'.$record->id)
            ->where('action', 'organisation.corrected')->count());
    }

    public function test_register_does_not_accept_invalid_relations_or_grant_access_to_scoped_users(): void
    {
        $url = route('admin.structure.register.store', 'programme-levels');
        $this->post($url)->assertRedirectToRoute('login');
        $department = Department::factory()->create();
        $this->academicUser('dean', 'faculty:'.$department->faculty_id);
        $this->post($url)->assertForbidden();
        $this->academicUser();
        $this->post($url, ['academic_programme_id' => 'invalid', 'code' => '100', 'label' => 'Year 1', 'position' => 1])
            ->assertSessionHasErrors('academic_programme_id');
        $this->assertDatabaseCount('programme_levels', 0);
    }

    private function programme(string $code): string
    {
        $this->post(route('admin.structure.register.store', 'shared-programmes'), ['code' => $code, 'name' => $code.' programme'])
            ->assertRedirectToRoute('admin.structure');

        return DB::table('academic_programmes')->where('code', $code)->value('id');
    }

    private function levelRevision(): string
    {
        return $this->get(route('admin.structure'))->assertOk()->viewData('page')['props']['register']['levels'][0]['revision'];
    }

    private function specialization(Department $department): string
    {
        $this->post(route('admin.structure.register.store', 'specializations'), [
            'department_id' => $department->id,
            'code' => 'SE',
            'name' => 'Software Engineering',
        ])->assertRedirectToRoute('admin.structure');

        return DB::table('specializations')->where('department_id', $department->id)->value('id');
    }
}
