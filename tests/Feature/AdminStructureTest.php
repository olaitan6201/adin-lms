<?php

namespace Tests\Feature;

use App\Models\AcademicSession;
use App\Models\AuditLog;
use App\Models\Course;
use App\Models\CurriculumCourse;
use App\Models\Department;
use App\Models\Faculty;
use App\Models\Offering;
use App\Models\Semester;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class AdminStructureTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_structure_reads_persisted_records_and_calendar_windows(): void
    {
        $this->academicUser();
        $faculty = Faculty::factory()->create();
        $session = AcademicSession::factory()->create();
        $semester = Semester::factory()->create(['session_id' => $session->id, 'position' => 1]);

        $this->get(route('admin.structure'))->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Admin/LiveStructure')
            ->missing('screenKey')
            ->missing('manage')
            ->where('faculties.0.id', $faculty->id)
            ->where('faculties.0.code', $faculty->code)
            ->where('sessions.0.starts_on', $session->starts_on->toDateString())
            ->where('sessions.0.ends_on', $session->ends_on->toDateString())
            ->where('semesters.0.id', $semester->id)
            ->where('semesters.0.session_id', $session->id)
            ->where('semesters.0.position', 1)
            ->where('semesters.0.starts_on', $semester->starts_on->toDateString())
            ->where('semesters.0.ends_on', $semester->ends_on->toDateString())
            ->where('actions.faculties', route('admin.structure.store', 'faculties', false))
            ->where('import.preview', route('admin.structure.import.preview', [], false)));
    }

    public function test_structure_mutations_validate_and_redirect_to_live_structure(): void
    {
        $actor = $this->academicUser();
        $store = route('admin.structure.store', 'faculties');
        $this->post($store, ['code' => 'SCI', 'name' => 'Science'])->assertRedirectToRoute('admin.structure');
        $this->post($store, ['code' => 'SCI', 'name' => 'Another'])->assertSessionHasErrors('code');
        $faculty = Faculty::where('code', 'SCI')->sole();

        $this->patch(route('admin.structure.update', ['faculties', $faculty->id]), [
            'code' => 'SCI',
            'name' => 'Sciences',
        ])->assertRedirectToRoute('admin.structure');
        $this->assertDatabaseHas('faculties', ['id' => $faculty->id, 'name' => 'Sciences']);
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $actor->id, 'subject_key' => 'faculties:'.$faculty->id]);
    }

    public function test_structure_requires_institution_structure_permission(): void
    {
        $department = Department::factory()->create();
        $this->get(route('admin.structure'))->assertRedirectToRoute('login');
        $this->academicUser('dean', 'faculty:'.$department->faculty_id);
        $this->get(route('admin.structure'))->assertForbidden();
        $this->post(route('admin.structure.store', 'faculties'))->assertForbidden();
    }

    public function test_calendar_corrections_keep_date_only_values_and_audit_the_original_fields(): void
    {
        $actor = $this->academicUser();
        $before = ['label' => '2026/27', 'starts_on' => '2026-09-01', 'ends_on' => '2027-06-30'];
        $after = array_replace($before, ['ends_on' => '2027-07-15']);

        $this->post(route('admin.structure.store', 'sessions'), $before)->assertRedirectToRoute('admin.structure');
        $session = AcademicSession::query()->sole();
        $this->assertTrue(Str::isUuid($session->id, 7));
        $updated = 'eloquent.updated: '.AcademicSession::class;
        Event::fake([$updated]);
        $this->patch(route('admin.structure.update', ['sessions', $session->id]), $after)
            ->assertRedirectToRoute('admin.structure');

        $this->assertDatabaseHas('academic_sessions', ['id' => $session->id] + $after);
        Event::assertDispatched($updated, fn (string $event, AcademicSession $record): bool => $record->is($session));
        $audit = AuditLog::query()->where('subject_key', 'academic_sessions:'.$session->id)->sole();
        $this->assertSame($actor->id, $audit->actor_id);
        $this->assertSame('organisation.corrected', $audit->action);
        $this->assertAuditAttributes($audit, $before, $after);
    }

    public function test_semester_corrections_keep_dates_and_position_types_in_the_audit(): void
    {
        $this->academicUser();
        $session = AcademicSession::factory()->create();
        $before = [
            'session_id' => $session->id,
            'position' => 1,
            'starts_on' => '2026-09-01',
            'ends_on' => '2027-01-31',
        ];
        $after = array_replace($before, ['position' => '2', 'ends_on' => '2027-02-15']);

        $this->post(route('admin.structure.store', 'semesters'), $before)->assertRedirectToRoute('admin.structure');
        $semester = Semester::query()->sole();
        $this->patch(route('admin.structure.update', ['semesters', $semester->id]), $after)
            ->assertRedirectToRoute('admin.structure');

        $this->assertDatabaseHas('semesters', ['id' => $semester->id] + array_replace($after, ['position' => 2]));
        $audit = AuditLog::query()->where('subject_key', 'semesters:'.$semester->id)->sole();
        $this->assertAuditAttributes($audit, $before, $after);
    }

    public function test_a_department_with_course_history_cannot_move_and_transfer_roster_access(): void
    {
        $department = Department::factory()->create();
        $destination = Faculty::factory()->create();
        $course = Course::factory()->create(['department_id' => $department->id]);
        $plan = CurriculumCourse::factory()->create(['course_id' => $course->id]);
        $offering = Offering::factory()->create(['curriculum_course_id' => $plan->id]);
        $originalDean = $this->academicUser('dean', 'faculty:'.$department->faculty_id);
        $otherDean = $this->academicUser('dean', 'faculty:'.$destination->id);
        $actor = $this->academicUser();

        $this->patch(route('admin.structure.update', ['departments', $department->id]), [
            'code' => $department->code,
            'name' => $department->name,
            'faculty_id' => $destination->id,
        ])->assertSessionHasErrors('faculty_id');
        $this->assertSame($department->faculty_id, $department->fresh()->faculty_id);
        $this->assertDatabaseMissing('audit_logs', [
            'actor_id' => $actor->id,
            'subject_key' => 'departments:'.$department->id,
            'action' => 'organisation.corrected',
        ]);
        $offering->load('curriculumCourse.course.department');
        $authority = app(ScopedAuthority::class);
        $this->assertTrue($authority->rosterAllows($originalDean->fresh(), $offering));
        $this->assertFalse($authority->rosterAllows($otherDean->fresh(), $offering));
    }

    public function test_oversized_semester_positions_are_rejected_on_create_and_update(): void
    {
        $this->academicUser();
        $semester = Semester::factory()->create(['position' => 1]);
        $invalid = [
            'session_id' => $semester->session_id,
            'starts_on' => '2026-01-01',
            'ends_on' => '2026-02-01',
            'position' => '2147483648',
        ];

        $this->post(route('admin.structure.store', 'semesters'), $invalid)->assertSessionHasErrors('position');
        $this->patch(route('admin.structure.update', ['semesters', $semester->id]), $invalid)
            ->assertSessionHasErrors('position');
        $this->assertDatabaseCount('semesters', 1);
        $this->assertSame(1, $semester->fresh()->position);
    }

    public function test_malformed_semester_session_ids_are_rejected_before_database_validation(): void
    {
        $this->academicUser();
        $semester = Semester::factory()->create();
        $invalid = [
            'session_id' => 'not-a-uuid',
            'starts_on' => '2026-01-01',
            'ends_on' => '2026-02-01',
            'position' => 2,
        ];

        $this->post(route('admin.structure.store', 'semesters'), $invalid)->assertSessionHasErrors('session_id');
        $this->patch(route('admin.structure.update', ['semesters', $semester->id]), $invalid)
            ->assertSessionHasErrors('session_id');
        $this->assertDatabaseCount('semesters', 1);
        $this->assertSame($semester->session_id, $semester->fresh()->session_id);
    }

    private function assertAuditAttributes(AuditLog $audit, array $before, array $after): void
    {
        $this->assertSame(collect($before)->sortKeys()->all(), collect($audit->details['before'])->sortKeys()->all());
        $this->assertSame(collect($after)->sortKeys()->all(), collect($audit->details['after'])->sortKeys()->all());
    }
}
