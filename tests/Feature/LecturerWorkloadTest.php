<?php

namespace Tests\Feature;

use App\Models\Enrolment;
use App\Models\Grade;
use App\Models\Lecturer;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\Support\BuildsLecturerWorkload;
use Tests\TestCase;

class LecturerWorkloadTest extends TestCase
{
    use BuildsLecturerWorkload;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_unauthenticated_workload_request_redirects_to_login(): void
    {
        $this->get('/workload')->assertRedirect(route('login'));
    }

    public function test_workload_page_forbids_accounts_without_a_lecturer_profile(): void
    {
        $this->actingAs(User::factory()->create())->get('/workload')->assertForbidden();
    }

    public function test_selected_term_lists_only_its_allocated_classes_with_enrolment_and_released_performance_totals(): void
    {
        $fixture = $this->fixture();
        $response = $this->actingAs($fixture['user']->fresh())
            ->get('/workload?term='.$fixture['currentTerm']->id);

        $response->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Workload')
            ->where('report', null)
            ->has('workload.terms', 2)
            ->where('workload.selected_term', $fixture['currentTerm']->id)
            ->has('workload.classes', 2)
            ->where('workload.classes.0.id', $fixture['first']->id)
            ->where('workload.classes.1.id', $fixture['second']->id)
            ->where('workload.classes.0.report_url', route('workload.show', $fixture['first']))
            ->where('workload.classes.0.totals', ['enrolled' => 2, 'completed' => 1, 'released_results' => 2, 'average_percent' => '75.00'])
            ->where('workload.classes.1.totals', ['enrolled' => 1, 'completed' => 0, 'released_results' => 1, 'average_percent' => '50.00'])
            ->where('workload.totals', ['classes' => 2, 'enrolled' => 3, 'completed' => 1, 'released_results' => 3]))
            ->assertDontSee('91.12345678')
            ->assertDontSee('92.12345678')
            ->assertDontSee('93.12345678');

        $this->get('/workload?term='.$fixture['otherTerm']->id)->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Workload')
            ->where('workload.selected_term', $fixture['otherTerm']->id)
            ->has('workload.classes', 1)
            ->where('workload.classes.0.id', $fixture['other']->id)
            ->where('workload.classes.0.totals.enrolled', 4)
            ->where('workload.classes.0.totals.released_results', 1)
            ->where('workload.classes.0.totals.average_percent', '93.12'));
    }

    public function test_class_without_released_results_reports_zero_and_no_average(): void
    {
        $fixture = $this->fixture();
        Grade::whereIn(
            'enrolment_id',
            Enrolment::where('offering_id', $fixture['second']->id)->select('id'),
        )->delete();

        $this->actingAs($fixture['user']->fresh())
            ->get('/workload?term='.$fixture['currentTerm']->id)
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Workload')
                ->where('workload.classes.1.totals', [
                    'enrolled' => 1,
                    'completed' => 0,
                    'released_results' => 0,
                    'average_percent' => null,
                ]));
    }

    public function test_latest_allocated_term_is_selected_by_default(): void
    {
        $fixture = $this->fixture();

        $this->actingAs($fixture['user']->fresh())->get('/workload')->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Workload')
            ->where('workload.selected_term', $fixture['currentTerm']->id)
            ->has('workload.classes', 2));
    }

    public function test_workload_rejects_unallocated_terms_and_malformed_filters_with_404(): void
    {
        $fixture = $this->fixture();
        $unallocatedTerm = Semester::factory()->create();

        $this->actingAs($fixture['user']->fresh())
            ->get('/workload?term='.$unallocatedTerm->id)
            ->assertNotFound();
        $this->get('/workload?term[]=invalid')->assertNotFound();
    }

    public function test_lecturer_without_allocations_sees_an_explicit_empty_workload(): void
    {
        $user = User::factory()->create();
        Lecturer::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->get('/workload')->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Workload')
            ->has('workload.terms', 0)
            ->where('workload.selected_term', null)
            ->has('workload.classes', 0)
            ->where('workload.totals', ['classes' => 0, 'enrolled' => 0, 'completed' => 0, 'released_results' => 0]));
    }
}
