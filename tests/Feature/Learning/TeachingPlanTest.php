<?php

namespace Tests\Feature\Learning;

use App\Enums\TeachingPlanStatus;
use App\Models\Enrolment;
use App\Models\Module;
use App\Models\Offering;
use App\Models\TeachingAllocation;
use App\Models\TeachingPlan;
use App\Models\User;
use Database\Seeders\AuthoritySeeder;
use Database\Seeders\DemoStaffAuthoritySeeder;
use Inertia\Testing\AssertableInertia as Page;

class TeachingPlanTest extends LearningTestCase
{
    private Offering $shell;

    private array $data = [
        'previous_revision' => 0, 'title' => 'Computing studio', 'introduction' => 'Compare two algorithms.',
        'weeks' => [['title' => 'Observe', 'body' => 'Collect measurements.'], ['title' => 'Explain', 'body' => 'Analyse the results.']],
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed([AuthoritySeeder::class, DemoStaffAuthoritySeeder::class]);
        $this->shell = Offering::whereExternalOfferingId('DEMO-CSC101-2026-2')->sole();
        $this->base = route('learning.plan', $this->shell);
        $this->lecturer();
    }

    private function lecturer(): void
    {
        $this->actingAs($this->teacher)->withSession(['security.mfa_user' => $this->teacher->id]);
    }

    private function reviewer(): void
    {
        $officer = User::whereEmail('officer@demo.example.test')->sole();
        $this->actingAs($officer)->withSession(['security.mfa_user' => $officer->id]);
    }

    public function test_rejected_snapshot_survives_revision_and_approval_only_creates_draft_lessons_once(): void
    {
        $official = $this->shell->getRawOriginal();
        $this->post($this->base, $this->data)->assertRedirect($this->base);
        $this->post($this->base, $this->data)->assertRedirect($this->base);
        $first = TeachingPlan::sole();
        $decision = $this->base.'/'.$first->id.'/review';
        $this->post($decision, ['decision' => 'approved'])->assertForbidden();
        $this->artisan('authority:grant', ['user' => $this->teacher->id, 'role' => 'institutional_admin', 'scope' => 'institution'])->assertSuccessful();
        $this->lecturer();
        $this->post($decision, ['decision' => 'approved'])->assertForbidden();
        $this->reviewer();
        $this->get(route('academics.delivery'))->assertInertia(fn (Page $p) => $p->where('pendingPlans.0.offering_id', $this->shell->id));
        $this->post($decision, ['decision' => 'rejected'])->assertSessionHasErrors('reason');
        $this->post($decision, ['decision' => 'rejected', 'reason' => 'Include fieldwork.'])->assertRedirect();
        $this->lecturer();
        $updated = $this->data;
        $updated['previous_revision'] = 1;
        $updated['weeks'][0]['body'] = 'Record three field measurements.';
        $this->post($this->base, $updated)->assertRedirect();
        $this->post($this->base, $this->data)->assertConflict();
        $this->reviewer();
        $second = TeachingPlan::whereRevision(2)->sole();
        $decision = $this->base.'/'.$second->id.'/review';
        $this->post($decision, ['decision' => 'approved'])->assertRedirect();
        $this->post($decision, ['decision' => 'approved'])->assertRedirect();
        $this->post($decision, ['decision' => 'rejected', 'reason' => 'Changed mind'])->assertConflict();
        $this->assertSame(TeachingPlanStatus::Rejected, $first->refresh()->status);
        $this->assertSame('Collect measurements.', $first->snapshot['weeks'][0]['body']);
        $this->assertSame(TeachingPlanStatus::Approved, $second->refresh()->status);
        $drafts = Module::where('offering_id', $this->shell->id)->orderBy('position')->get();
        $this->assertSame(['draft:overview', 'draft:weekly', 'draft:weekly'], $drafts->pluck('kind')->all());
        $this->assertSame('Record three field measurements.', $drafts[1]->body);
        $this->assertSame($official, $this->shell->refresh()->getRawOriginal());
        $this->assertSame(0, Enrolment::where('offering_id', $this->shell->id)->count());
        $this->assertSame(1, TeachingAllocation::where('offering_id', $this->shell->id)->count());
        $this->actingAs($this->learner)->get($this->base)->assertForbidden();
        $this->get(route('learning.index', $this->shell))->assertNotFound();
    }

    public function test_empty_shell_cannot_be_approved_after_it_is_archived(): void
    {
        $this->post($this->base, $this->data)->assertRedirect();
        $this->reviewer();
        $this->post(route('academics.delivery.change', [$this->shell, 'archive']))->assertSessionHasNoErrors();
        $this->post(route('learning.plan.review', [$this->shell, TeachingPlan::sole()]), ['decision' => 'approved'])->assertConflict();
        $this->assertFalse(Module::where('offering_id', $this->shell->id)->exists());
        $this->lecturer();
        $this->get($this->base)->assertInertia(fn (Page $p) => $p->where('canSubmit', false));
    }

    public function test_proposal_is_scoped_to_an_allocated_empty_draft_and_the_reviewed_shell_snapshot(): void
    {
        $unassigned = Offering::factory()->create();
        $this->post(route('learning.plan.submit', $unassigned), $this->data)->assertForbidden();
        $this->post(route('learning.plan.submit', $this->offering), $this->data)->assertConflict();
        $this->post($this->base, $this->data)->assertRedirect();
        $plan = TeachingPlan::sole();
        $this->reviewer();
        $this->post(route('learning.plan.review', [$unassigned, $plan]), ['decision' => 'approved'])->assertNotFound();
        $this->shell->forceFill(['section' => 'B'])->save();
        $this->post(route('learning.plan.review', [$this->shell, $plan]), ['decision' => 'approved'])->assertConflict();
        $this->assertSame('A', $plan->refresh()->snapshot['shell']['section']);
        $this->shell->forceFill(['section' => 'A'])->save();
        TeachingAllocation::where('offering_id', $this->shell->id)->delete();
        $this->post(route('learning.plan.review', [$this->shell, $plan]), ['decision' => 'approved'])->assertConflict();
        $this->assertSame(TeachingPlanStatus::Submitted, $plan->refresh()->status);
        $this->assertFalse(Module::where('offering_id', $this->shell->id)->exists());
    }
}
