<?php

namespace Tests\Feature;

use App\Models\AcademicSession;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Programme;
use App\Models\Semester;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class AcademicHierarchyTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_hierarchy_integrity_and_session_positions(): void
    {
        $this->academicUser();
        $base = '/academics/organisation';
        foreach (['Science', 'Arts'] as $name) {
            $this->post("$base/faculties", ['name' => $name, 'code' => $name])->assertSessionHasNoErrors();
            $this->post("$base/departments", [
                'name' => $name,
                'code' => $name,
                'faculty_id' => Faculty::where('name', $name)->value('id'),
            ])->assertSessionHasNoErrors();
        }

        $department = Department::firstOrFail();
        $programme = ['department_id' => $department->id, 'code' => 'CS', 'name' => 'Computing'];
        $this->post(
            "$base/programmes",
            ['department_id' => (string) Str::uuid7()] + $programme,
        )->assertSessionHasErrors('department_id');
        $this->post("$base/programmes", $programme)->assertSessionHasNoErrors();
        $this->delete("/academics/departments/$department->id")->assertSessionHasErrors('department');
        $this->assertTrue(Programme::sole()->department->is($department));
        $id = Programme::sole()->id;
        $corrected = ['department_id' => Department::whereKeyNot($department->id)->sole()->id, 'name' => 'Computing Sciences'] + $programme;
        $this->patch("$base/programmes/$id", $corrected)->assertSessionHasNoErrors();
        $this->assertDatabaseHas('programmes', ['id' => $id] + $corrected);
        $this->assertDatabaseHas('audit_logs', ['subject_key' => "programmes:$id", 'action' => 'organisation.corrected']);
        $this->post("$base/levels", ['label' => '100'])->assertSessionHasNoErrors();
        $semester = ['position' => 1, 'starts_on' => '2026-01-01', 'ends_on' => '2026-02-01'];
        foreach (['2026', '2027'] as $label) {
            $this->post("$base/sessions", ['label' => $label] + $semester)->assertSessionHasNoErrors();
            $data = ['session_id' => AcademicSession::where('label', $label)->value('id')] + $semester;
            $this->post("$base/semesters", ['ends_on' => '2025-12-31'] + $data)->assertSessionHasErrors(
                'ends_on',
            );
            $this->post("$base/semesters", $data)->assertSessionHasNoErrors();
            $this->post("$base/semesters", $data)->assertSessionHasErrors('position');
        }
    }

    public function test_calendar_correction_forms_receive_date_only_values_for_existing_records(): void
    {
        $this->academicUser();
        $dates = ['starts_on' => '2026-09-01', 'ends_on' => '2027-01-31'];
        $session = AcademicSession::factory()->create($dates);
        Semester::factory()->create(['session_id' => $session->id] + $dates);

        $this->get('/academics')->assertInertia(fn (AssertableInertia $page) => $page
            ->where('sessions.0.starts_on', $dates['starts_on'])
            ->where('sessions.0.ends_on', $dates['ends_on'])
            ->where('semesters.0.starts_on', $dates['starts_on'])
            ->where('semesters.0.ends_on', $dates['ends_on']));
    }

    public function test_scoped_readers_cannot_open_another_department(): void
    {
        $own = Department::factory()->create();
        $other = Department::factory()->create();
        foreach (
            ['dean' => 'faculty:'.$own->faculty_id, 'head_of_department' => 'department:'.$own->id] as $role => $scope
        ) {
            $this->academicUser($role, $scope);
            $this->get('/academics')->assertInertia(
                fn (AssertableInertia $p) => $p->has('departments', 1)->where('departments.0.id', $own->id),
            );
            $this->get("/academics/departments/$other->id")->assertNotFound();
            $this->post('/academics/organisation/faculties', [])->assertForbidden();
            $this->patch("/academics/organisation/departments/$own->id", ['name' => 'Changed'])->assertForbidden();
        }
    }
}
