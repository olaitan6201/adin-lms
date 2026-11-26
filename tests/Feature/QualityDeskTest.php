<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Enums\RoleCode;
use App\Models\CourseOutcome;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\OutcomeMapping;
use App\Models\ProgrammeOutcome;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use Database\Seeders\AuthoritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class QualityDeskTest extends TestCase
{
    use RefreshDatabase;

    private function signIn(RoleCode $role): void
    {
        $user = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($user->id, $role, 'institution', false);
        $this->actingAs($user)->withSession(['security.mfa_user' => $user->id]);
    }

    public function test_desk_requires_institutional_compliance_read_even_for_administrators(): void
    {
        $this->seed(AuthoritySeeder::class);
        $this->get('/admin/qa')->assertRedirect(route('login'));
        $this->signIn(RoleCode::SuperAdmin);
        $this->get('/admin/qa')->assertForbidden();
    }

    public function test_qa_sees_live_version_evidence_and_reviewed_queue_without_approval_authority(): void
    {
        $this->seed(AuthoritySeeder::class);
        $this->signIn(RoleCode::QualityAssuranceOfficer);
        $empty = $this->get('/admin/qa')->assertOk()->viewData('page');
        $this->assertSame('Admin/Quality', $empty['component']);
        $this->assertSame([], $empty['props']['evidence']);
        $this->assertSame([], $empty['props']['queue']);
        $approved = Curriculum::factory()->create(['status' => CurriculumStatus::Approved]);
        $reviewed = Curriculum::factory()->create(['status' => CurriculumStatus::Reviewed]);
        Curriculum::factory()->create();
        $entry = CurriculumCourse::factory()->create(['curriculum_id' => $approved->id]);
        $mapped = ProgrammeOutcome::forceCreate(['curriculum_id' => $approved->id, 'statement' => 'Analyse results']);
        ProgrammeOutcome::forceCreate(['curriculum_id' => $approved->id, 'statement' => 'Communicate results']);
        foreach (['Interpret charts', 'Identify outliers'] as $statement) {
            $course = CourseOutcome::forceCreate(['curriculum_course_id' => $entry->id, 'statement' => $statement]);
            OutcomeMapping::forceCreate(['course_outcome_id' => $course->id, 'programme_outcome_id' => $mapped->id]);
        }

        $props = $this->get('/admin/qa')->assertOk()->viewData('page')['props'];
        $this->assertSame(1, $props['approvedCount']);
        $this->assertSame(1, $props['reviewedCount']);
        $this->assertSame(2, $props['evidence'][0]['outcomes']);
        $this->assertSame(1, $props['evidence'][0]['mapped']);
        $this->assertSame(["/academics/curriculum/$approved->id"], array_column($props['evidence'], 'href'));
        $this->assertSame(["/academics/curriculum/$reviewed->id"], array_column($props['queue'], 'href'));
        foreach ([$props['catalogueHref'], $props['evidence'][0]['href'], $props['queue'][0]['href']] as $href) {
            $this->get($href)->assertOk();
        }
        $this->post("/academics/curriculum/$reviewed->id/approve")->assertForbidden();
        $this->assertSame(CurriculumStatus::Reviewed, $reviewed->fresh()->status);
    }
}
