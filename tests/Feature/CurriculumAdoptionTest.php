<?php

namespace Tests\Feature;

use App\Enums\CurriculumStatus;
use App\Models\AcademicPathway;
use App\Models\AcademicSession;
use App\Models\Curriculum;
use App\Models\CurriculumAdoption;
use App\Models\CurriculumAdoptionDecision;
use App\Models\CurriculumCourse;
use App\Models\Enrolment;
use App\Models\EntryCohort;
use App\Models\Offering;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class CurriculumAdoptionTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_changing_the_operative_decision_retains_history_and_ignores_an_identical_delayed_replay(): void
    {
        $actor = $this->academicUser('super_admin');
        $session = AcademicSession::factory()->create();
        $cohort = EntryCohort::factory()->create();
        $pathway = AcademicPathway::factory()->create();
        $previous = $this->approvedVersion($actor, $pathway, 1);
        $replacement = $this->approvedVersion($actor, $pathway, 2);
        $unrelated = $this->unrelatedAdoption($previous, $session);
        $unrelatedDecision = $unrelated->active_decision_id;
        $olderAssignment = CurriculumCourse::factory()->create(['curriculum_id' => $previous->id]);
        $offering = Offering::factory()->create(['curriculum_course_id' => $olderAssignment->id]);
        $enrolment = Enrolment::factory()->for($offering)->create();
        $firstRequest = [
            'academic_session_id' => $session->id,
            'entry_cohort_id' => $cohort->id,
            'curriculum_id' => $previous->id,
            'decision_reference' => 'BOARD-001',
            'reason' => 'Initial adoption.',
            'approved_by' => User::factory()->create()->id,
            'academic_pathway_id' => AcademicPathway::factory()->create()->id,
        ];

        $this->freezeTime();
        $this->submit($firstRequest);

        $adoption = CurriculumAdoption::where('entry_cohort_id', $cohort->id)->sole();
        $firstDecision = $adoption->activeDecision;
        $firstDecisionFields = $firstDecision->getRawOriginal();
        $this->assertDatabaseHas('curriculum_adoption_decisions', [
            'id' => $firstDecision->id,
            'academic_pathway_id' => $pathway->id,
            'academic_session_id' => $session->id,
            'entry_cohort_id' => $cohort->id,
            'curriculum_id' => $previous->id,
            'approved_by' => $actor->id,
            'decision_reference' => 'BOARD-001',
            'reason' => 'Initial adoption.',
        ]);
        $this->assertSame(now()->toDateTimeString(), $firstDecision->recorded_at->toDateTimeString());

        $this->submit($firstRequest);
        $this->assertDatabaseCount('curriculum_adoption_decisions', 2);

        $replacementRequest = array_replace($firstRequest, [
            'curriculum_id' => $replacement->id,
            'decision_reference' => 'BOARD-002',
            'reason' => 'Replacement applies to this tuple only.',
        ]);
        $this->submit($replacementRequest);
        $this->submit($firstRequest);

        $this->assertDatabaseCount('curriculum_adoptions', 2);
        $this->assertDatabaseCount('curriculum_adoption_decisions', 3);
        $this->assertSame($firstDecisionFields, $firstDecision->fresh()->getRawOriginal());
        $current = $adoption->fresh()->activeDecision;
        $this->assertSame($replacement->id, $current->curriculum_id);
        $this->assertSame('BOARD-002', $current->decision_reference);
        $this->assertSame($unrelatedDecision, $unrelated->fresh()->active_decision_id);
        $this->assertDatabaseHas('curricula', ['id' => $previous->id, 'version' => 1, 'status' => 'approved']);
        $this->assertDatabaseHas('offerings', ['id' => $offering->id, 'curriculum_course_id' => $olderAssignment->id]);
        $this->assertDatabaseHas('enrolments', ['id' => $enrolment->id, 'offering_id' => $offering->id]);
    }

    /** @param array<string, string> $request */
    private function submit(array $request): void
    {
        $this->post('/admin/academic-core/adoptions', $request)
            ->assertRedirectToRoute('admin.academic-core', ['curriculum' => $request['curriculum_id']])
            ->assertSessionHasNoErrors();
    }

    private function approvedVersion(User $actor, AcademicPathway $pathway, int $version): Curriculum
    {
        return Curriculum::factory()->create([
            'academic_pathway_id' => $pathway->id,
            'academic_programme_id' => $pathway->academic_programme_id,
            'version' => $version,
            'status' => CurriculumStatus::Approved,
            'approved_by' => $actor->id,
            'approved_at' => now(),
        ]);
    }

    private function unrelatedAdoption(Curriculum $version, AcademicSession $session): CurriculumAdoption
    {
        $decision = CurriculumAdoptionDecision::factory()
            ->for($version)
            ->for($session)
            ->create();

        return CurriculumAdoption::factory()->for($decision, 'activeDecision')->create();
    }
}
