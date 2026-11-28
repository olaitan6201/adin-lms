<?php

namespace Tests\Feature;

use App\Models\CurriculumAdoption;
use App\Models\CurriculumAdoptionDecision;
use App\Models\PlacementAcceptance;
use App\Models\ProgrammeLevel;
use App\Models\Student;
use App\Services\Academics\OfficialPlacementRegister;
use App\Services\Academics\PlacementCsvRow;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

final class OfficialPlacementRegisterTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_registrar_approval_holds_gaps_backdated_rows_and_exact_replays(): void
    {
        $actor = $this->academicUser('registrar');
        $initial = $this->row();
        $second = $this->revision($initial, 2, now()->startOfYear()->addDays(4)->toDateString());
        $register = app(OfficialPlacementRegister::class);
        $waiting = $register->queue($actor, $second);
        $this->assertHeld(fn () => $register->accept($actor, $waiting));

        $first = $register->queue($actor, $initial);
        $pin = CurriculumAdoption::sole()->activeDecision;
        $accepted = $register->accept($actor, $first);
        $this->assertSame($pin->id, $accepted->curriculum_adoption_decision_id);
        $this->assertSame($actor->id, $accepted->approved_by);

        $next = $pin->curriculum->replicate()->forceFill(['version' => 2]);
        $next->save();
        $replacement = $pin->replicate()->forceFill(['curriculum_id' => $next->id]);
        $replacement->save();
        CurriculumAdoption::sole()->forceFill(['active_decision_id' => $replacement->id])->save();
        $this->assertSame($pin->id, $register->accept($actor, $waiting)->curriculum_adoption_decision_id);
        $this->assertSame($accepted->id, $register->accept($actor, $register->queue($actor, $initial))->id);

        $backdated = $register->queue($actor, $this->revision($initial, 3, $initial->effectiveOn));
        $this->assertHeld(fn () => $register->accept($actor, $backdated));
        $this->assertDatabaseCount('placement_acceptances', 2);
        $this->assertDatabaseCount('student_sessions', 0);
        $this->assertDatabaseCount('enrolments', 0);
    }

    public function test_super_admin_is_not_a_registrar_and_cannot_approve(): void
    {
        $row = $this->row();
        $register = app(OfficialPlacementRegister::class);
        $update = $register->queue($this->academicUser('registrar'), $row);

        $this->expectException(AuthorizationException::class);
        $register->accept($this->academicUser('super_admin'), $update);
    }

    public function test_zero_update_does_not_create_a_registration_or_review_row(): void
    {
        $actor = $this->academicUser('registrar');
        $valid = $this->row();
        $invalid = $this->revision($valid, 0, $valid->effectiveOn);

        try {
            app(OfficialPlacementRegister::class)->queue($actor, $invalid);
            $error = null;
        } catch (ValidationException $exception) {
            $error = $exception;
        }

        $this->assertDatabaseEmpty('official_registrations');
        $this->assertDatabaseEmpty('placement_updates');
        $this->assertDatabaseEmpty('placement_acceptances');
        $this->assertInstanceOf(ValidationException::class, $error);
    }

    public function test_a_registrar_transfer_requires_a_reason_and_preserves_the_earlier_pin(): void
    {
        $this->travelTo(now()->startOfYear()->addDay()->setHour(9));
        $actor = $this->academicUser('registrar');
        $first = $this->row();
        $register = app(OfficialPlacementRegister::class);
        $earlier = $register->accept($actor, $register->queue($actor, $first))->refresh();
        $destination = CurriculumAdoptionDecision::factory()->create([
            'academic_session_id' => $first->sessionId,
            'entry_cohort_id' => $first->cohortId,
        ]);
        CurriculumAdoption::factory()->for($destination, 'activeDecision')->create();
        $level = ProgrammeLevel::factory()->for($destination->academicPathway->programme, 'programme')->create();
        $transfer = new PlacementCsvRow(
            $first->registrationId, 2, $first->studentId, $destination->academic_pathway_id,
            $first->sessionId, $first->cohortId, $level->id, now()->startOfYear()->addDay()->toDateString(),
        );
        $update = $register->queue($actor, $transfer);
        $this->post(route('admin.placements.approve', $update))
            ->assertSessionHasErrors(['reason' => 'Give a reason before approving a pathway or cohort change.'])
            ->assertSessionDoesntHaveErrors('placement');
        $this->assertDatabaseMissing('placement_acceptances', ['placement_update_id' => $update->id]);
        $this->get(route('admin.placements.index', $update))->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page->where('selected.requiresReason', true)->etc());
        $approval = now()->toImmutable();
        $this->travel(1)->day();
        $this->assertHeld(fn () => $register->accept($actor, $update, 'Authorized transfer TR-2'));
        $this->travelTo($approval);
        $accepted = $register->accept($actor, $update, 'Authorized transfer TR-2');

        $this->assertSame($destination->id, $accepted->curriculum_adoption_decision_id);
        $this->assertSame('Authorized transfer TR-2', $accepted->approval_note);
        $this->assertTrue($accepted->effective_at->equalTo($approval->addSecond()));
        $this->assertSame($earlier->getRawOriginal(), PlacementAcceptance::findOrFail($earlier->id)->getRawOriginal());
    }

    private function row(): PlacementCsvRow
    {
        $adoption = CurriculumAdoption::factory()->create();
        $student = Student::factory()->create();
        $level = ProgrammeLevel::factory()->for($adoption->activeDecision->academicPathway->programme, 'programme')->create();

        return new PlacementCsvRow(
            'REG-001', 1, $student->external_student_id, $adoption->academic_pathway_id,
            $adoption->academic_session_id, $adoption->entry_cohort_id, $level->id,
            now()->startOfYear()->toDateString(),
        );
    }

    private function revision(PlacementCsvRow $row, int $number, string $date): PlacementCsvRow
    {
        return new PlacementCsvRow(
            $row->registrationId, $number, $row->studentId, $row->pathwayId,
            $row->sessionId, $row->cohortId, $row->programmeLevelId, $date,
        );
    }

    private function assertHeld(callable $operation): void
    {
        try {
            $operation();
            $this->fail('The placement should have stayed on hold.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('placement', $exception->errors());
        }
    }
}
