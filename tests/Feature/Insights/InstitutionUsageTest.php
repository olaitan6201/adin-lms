<?php

namespace Tests\Feature\Insights;

use App\Models\AcademicSession;
use App\Models\Course;
use App\Models\Department;
use App\Models\Lecturer;
use App\Models\Student;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use Illuminate\Support\Carbon;
use PhpOffice\PhpSpreadsheet\IOFactory;

final class InstitutionUsageTest extends InsightCase
{
    use AssessmentFixture;

    private const QUERY = '?family=institution-usage';

    public function test_population_and_window_reconcile_without_course_participation_and_export_exact_counts(): void
    {
        $now = Carbon::parse('2026-11-25 12:00:00', 'UTC');
        $this->travelTo($now);
        $student = $this->loginAs('ada');
        $this->assessmentFixture($student);
        $admin = $this->loginAs('officer');
        $unit = Department::factory()->create();
        Lecturer::factory()->create(['department_id' => $unit->id]);
        Course::factory()->create(['department_id' => $unit->id]);
        Student::factory()->create(['user_id' => null]);
        AcademicSession::factory()->create(['starts_on' => '2026-11-01', 'ends_on' => '2026-11-25']);
        AcademicSession::factory()->create(['starts_on' => '2026-11-26', 'ends_on' => '2027-01-02']);
        foreach ([
            [$admin->id, 'password.accepted', $now],
            [$admin->id, 'password.accepted', $now->copy()->subDay()],
            [$student->id, 'oidc.accepted', $now->copy()->subDays(7)->addSecond()],
            [$student->id, 'password.accepted', $now->copy()->subDays(7)],
            [$student->id, 'password.accepted', $now->copy()->addSecond()],
            [$admin->id, 'mfa.accepted', $now],
            [null, 'password.failed', $now],
        ] as [$id, $outcome, $time]) {
            $this->record('login_events', ['user_id' => $id, 'outcome' => $outcome, 'occurred_at' => $time]);
        }
        $page = $this->data('/reports'.self::QUERY);
        $counts = array_column($page['table']['rows'], 1, 0);
        $population = ['Student profiles' => 3, 'Lecturer profiles' => 2, 'Catalogue courses' => 3,
            'Departments' => 2, 'Active academic sessions' => 2];
        $this->assertSame($population, $this->data('/dashboard')['population']);
        $this->assertSame($population + ['Accounts with accepted credentials' => 2, 'Credential acceptances' => 3,
            'Assignment revisions received' => 1, 'Exam attempts started' => 1], $counts);
        $this->assertNull($page['options']);
        $path = tempnam(sys_get_temp_dir(), 'usage-');
        try {
            file_put_contents($path, $this->get('/reports/export/xlsx'.self::QUERY)->assertDownload()->streamedContent());
            $actual = IOFactory::load($path)->getActiveSheet()->toArray(null, false, false);
            $this->assertSame([$page['columns'], ...$page['table']['rows']], $actual);
        } finally {
            unlink($path);
        }
    }

    public function test_empty_activity_is_zero_and_filters_cannot_imply_a_course_scoped_census(): void
    {
        $this->loginAs('officer');
        $rows = $this->data('/reports'.self::QUERY)['table']['rows'];
        $this->assertSame([0, 0, 0, 0], array_column(array_slice($rows, -4), 1));
        $this->assertStringContainsString('No recorded event', end($rows)[3]);
        $session = AcademicSession::firstOrFail();
        foreach (['/reports', '/reports/export/xlsx', '/reports/export/pdf'] as $path) {
            $this->get($path.self::QUERY.'&session='.$session->id)->assertUnprocessable();
        }
    }

    public function test_student_allocated_lecturer_and_department_head_cannot_access_the_census(): void
    {
        $head = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($head->id, 'head_of_department', 'department:'.Department::firstOrFail()->id, false);
        foreach ([$this->loginAs('ada'), $this->loginAs('lecturer'), $head] as $user) {
            $this->actingAs($user)->withSession(['security.mfa_user' => $user->id]);
            $this->assertNull($this->data('/dashboard')['population']);
            foreach (['/reports', '/reports/export/xlsx', '/reports/export/pdf'] as $path) {
                $this->get($path.self::QUERY)->assertForbidden();
            }
        }
    }
}
