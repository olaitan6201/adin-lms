<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CurriculumCourse;
use App\Models\Enrolment;
use App\Models\Lecturer;
use App\Models\Offering;
use App\Models\Semester;
use App\Models\TeachingAllocation;
use App\Models\User;
use Database\Seeders\AuthoritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\Support\BuildsWorkloadResults;
use Tests\TestCase;

class ClassWorkloadReportTest extends TestCase
{
    use BuildsWorkloadResults;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_unauthenticated_class_report_redirects_to_login(): void
    {
        $fixture = $this->fixture();

        $this->get(route('workload.show', $fixture['offering']))->assertRedirect(route('login'));
    }

    public function test_allocated_lecturer_with_scoped_role_sees_current_allocation_and_only_released_performance(): void
    {
        $fixture = $this->fixture();
        $response = $this->actingAs($fixture['user']->fresh())
            ->withSession(['security.mfa_user' => $fixture['user']->id])
            ->get(route('workload.show', $fixture['offering']));

        $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Staff/Workload')
            ->where('report.class.id', $fixture['offering']->id)
            ->where('report.class.code', 'CSC101')
            ->where('report.allocation.lecturer', 'Dr Ada Lecturer')
            ->where('report.allocation.staff_number', 'STAFF-020')
            ->where('report.totals', ['enrolled' => 1, 'completed' => 1, 'released_results' => 1, 'average_percent' => '80.00']))
            ->assertDontSee('91.12345678')
            ->assertDontSee('92.12345678');
    }

    public function test_removing_allocation_revokes_the_direct_report_even_when_the_role_grant_remains(): void
    {
        $fixture = $this->fixture();
        $fixture['allocation']->delete();
        $this->actingAs($fixture['user']->fresh())->withSession(['security.mfa_user' => $fixture['user']->id]);

        $this->get(route('workload.show', $fixture['offering']))->assertForbidden();
        $this->get('/workload')->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Staff/Workload')
            ->has('workload.classes', 0));
        $this->assertDatabaseMissing('teaching_allocations', ['id' => $fixture['allocation']->id]);
    }

    public function test_revoking_scoped_role_revokes_the_direct_report_even_when_the_allocation_remains(): void
    {
        $fixture = $this->fixture();
        $this->artisan('authority:grant', [
            'user' => $fixture['user']->id,
            'role' => 'lecturer',
            'scope' => 'offering:'.$fixture['offering']->id,
            '--revoke' => true,
        ])->assertSuccessful();
        $this->actingAs($fixture['user']->fresh())->withSession(['security.mfa_user' => $fixture['user']->id]);

        $this->get(route('workload.show', $fixture['offering']))->assertForbidden();
        $this->get('/workload')->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Staff/Workload')
            ->has('workload.classes', 0));
        $this->assertModelExists($fixture['allocation']);
    }

    public function test_another_lecturers_scoped_role_cannot_open_the_class_report(): void
    {
        $fixture = $this->fixture();
        $outsider = User::factory()->create();
        Lecturer::factory()->create(['user_id' => $outsider->id]);
        $otherOffering = Offering::factory()->create();
        $this->artisan('authority:grant', [
            'user' => $outsider->id,
            'role' => 'lecturer',
            'scope' => 'offering:'.$otherOffering->id,
        ])->assertSuccessful();

        $this->actingAs($outsider->fresh())
            ->withSession(['security.mfa_user' => $outsider->id])
            ->get(route('workload.show', $fixture['offering']))
            ->assertForbidden();
    }

    /** @return array{user: User, offering: Offering, allocation: TeachingAllocation} */
    private function fixture(): array
    {
        $this->seed(AuthoritySeeder::class);
        $user = User::factory()->create(['full_name' => 'Dr Ada Lecturer']);
        $lecturer = Lecturer::factory()->create(['user_id' => $user->id, 'staff_number' => 'STAFF-020']);
        $offering = Offering::factory()->create([
            'semester_id' => Semester::factory()->create(),
            'curriculum_course_id' => CurriculumCourse::factory()->create([
                'course_id' => Course::factory()->create(['code' => 'CSC101']),
                'title' => 'Algorithms',
            ])->id,
        ]);
        $allocation = TeachingAllocation::factory()->create([
            'lecturer_id' => $lecturer->id,
            'offering_id' => $offering->id,
        ]);
        $active = Enrolment::factory()->create(['offering_id' => $offering->id, 'completed_at' => now()]);
        $withdrawn = Enrolment::factory()->withdrawn()->create(['offering_id' => $offering->id]);
        $this->artisan('authority:grant', [
            'user' => $user->id,
            'role' => 'lecturer',
            'scope' => 'offering:'.$offering->id,
        ])->assertSuccessful();

        $this->grade($active, '80.00000000', 1, true, $user);
        $this->grade($active, '91.12345678', 2, false, $user);
        $this->grade($withdrawn, '92.12345678', 1, true, $user);

        return compact('user', 'offering', 'allocation');
    }
}
