<?php

namespace Tests\Feature;

use App\Enums\AccountStatus;
use App\Enums\CurriculumStatus;
use App\Enums\RoleCode;
use App\Enums\StudentStatus;
use App\Models\AcademicLevel;
use App\Models\AcademicSession;
use App\Models\Curriculum;
use App\Models\Department;
use App\Models\Lecturer;
use App\Models\Programme;
use App\Models\Student;
use App\Models\StudentSession;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class AdminStructureMetricsTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_structure_lists_only_active_scoped_assignees_and_updates_after_revocation(): void
    {
        $this->academicUser();
        $department = Department::factory()->create(['name' => 'A department']);
        Department::factory()->create(['faculty_id' => $department->faculty_id, 'name' => 'B department']);
        $facultyScope = 'faculty:'.$department->faculty_id;
        $departmentScope = 'department:'.$department->id;
        $grants = app(ChangeRoleGrant::class);
        $dean = User::factory()->create(['full_name' => 'Zainab Dean']);
        $secondDean = User::factory()->create(['full_name' => 'Ada Dean']);
        $head = User::factory()->create(['full_name' => 'Active Head']);
        $suspended = User::factory()->create(['status' => AccountStatus::Suspended]);
        $grants->apply($dean->id, RoleCode::Dean, $facultyScope, false);
        $grants->apply($secondDean->id, RoleCode::Dean, $facultyScope, false);
        $grants->apply($head->id, RoleCode::HeadOfDepartment, $departmentScope, false);
        $grants->apply($suspended->id, RoleCode::HeadOfDepartment, $departmentScope, false);

        $this->get(route('admin.structure'))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('faculties.0.dean_names', ['Ada Dean', 'Zainab Dean'])
            ->where('departments.0.hod_names', ['Active Head'])
            ->where('departments.1.hod_names', [])
            ->where('health.departments_with_active_hod', 1)
            ->missing('faculties.0.email')
            ->missing('departments.0.user_id'));

        $grants->apply($head->id, RoleCode::HeadOfDepartment, $departmentScope, true);

        $this->get(route('admin.structure'))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('departments.0.hod_names', [])
            ->where('health.departments_with_active_hod', 0));
    }

    #[TestWith(['dean', 'faculty'])]
    #[TestWith(['head_of_department', 'department'])]
    public function test_scoped_viewers_keep_organisation_access_without_admin_metrics(string $role, string $scope): void
    {
        $department = Department::factory()->create();
        $other = Department::factory()->create();
        $scopeId = $scope === 'faculty' ? $department->faculty_id : $department->id;
        $this->academicUser($role, "$scope:$scopeId");

        $this->get(route('admin.structure'))->assertForbidden();
        $this->get(route('academics.department', $other))->assertNotFound();
        $this->get(route('academics.index'))->assertInertia(fn (AssertableInertia $page) => $page
            ->has('departments', 1)
            ->where('departments.0.id', $department->id)
            ->missing('faculties.0.dean_names')
            ->missing('departments.0.hod_names')
            ->missing('health')
            ->missing('student_count_session'));
    }

    public function test_structure_counts_home_staff_and_programmes_once_regardless_of_approval_version_count(): void
    {
        $this->academicUser();
        $department = Department::factory()->create(['name' => 'A department']);
        $other = Department::factory()->create(['name' => 'B department']);
        $approved = Programme::factory()->for($department)->create();
        $reviewed = Programme::factory()->for($department)->create();
        Curriculum::factory()->for($approved)->create(['status' => CurriculumStatus::Approved]);
        Curriculum::factory()->for($approved)->create(['status' => CurriculumStatus::Approved, 'version' => 2]);
        Curriculum::factory()->for($approved)->create(['version' => 3]);
        Curriculum::factory()->for($reviewed)->create(['status' => CurriculumStatus::Reviewed]);
        Lecturer::factory()->for($department)->create();
        Lecturer::factory()->for($other)->create();
        $suspended = User::factory()->create(['status' => AccountStatus::Suspended]);
        Lecturer::factory()->for($department)->for($suspended)->create();

        $this->get(route('admin.structure'))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('departments.0.programme_count', 2)
            ->where('departments.0.active_lecturer_count', 1)
            ->where('departments.1.programme_count', 0)
            ->where('departments.1.active_lecturer_count', 1)
            ->where('health.programmes_with_approved_curriculum', 1));
    }

    public function test_student_counts_require_one_current_session_with_imported_profiles(): void
    {
        $this->travelTo(now()->setDate(2026, 11, 27));
        $this->academicUser();
        $department = Department::factory()->create(['name' => 'A department']);
        Programme::factory()->for(Department::factory()->create(['name' => 'B department']))->create();
        $programme = Programme::factory()->for($department)->create();

        $this->assertStudentCountsUnavailable();
        $current = AcademicSession::factory()->create(['starts_on' => '2026-11-27', 'ends_on' => '2027-05-30']);
        $past = AcademicSession::factory()->create(['starts_on' => '2025-11-27', 'ends_on' => '2026-05-30']);
        $level = AcademicLevel::factory()->create();
        $active = Student::factory()->create(['user_id' => null]);
        $this->recordStudentSession(Student::factory()->create(), $past, $programme, $level);
        $this->assertStudentCountsUnavailable();

        $suspended = Student::factory()->create(['status' => StudentStatus::Suspended]);
        $this->recordStudentSession($active, $current, $programme, $level);
        $this->recordStudentSession($suspended, $current, $programme, $level);
        $this->get(route('admin.structure'))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('student_count_session', $current->only('id', 'label'))
            ->where('departments.0.active_imported_student_count', 1)
            ->where('departments.1.active_imported_student_count', 0));

        AcademicSession::factory()->create(['starts_on' => '2026-08-01', 'ends_on' => '2026-11-27']);
        $this->assertStudentCountsUnavailable();
    }

    private function assertStudentCountsUnavailable(): void
    {
        $this->get(route('admin.structure'))->assertInertia(fn (AssertableInertia $page) => $page
            ->where('student_count_session', null)
            ->where('departments.0.active_imported_student_count', null));
    }

    private function recordStudentSession(Student $student, AcademicSession $session, Programme $programme, AcademicLevel $level): void
    {
        StudentSession::forceCreate([
            'student_id' => $student->id,
            'session_id' => $session->id,
            'programme_id' => $programme->id,
            'level_id' => $level->id,
        ]);
    }
}
