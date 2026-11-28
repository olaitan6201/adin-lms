<?php

namespace Tests\Feature;

use App\Enums\EnrolmentStatus;
use App\Models\CurriculumAdoption;
use App\Models\Enrolment;
use App\Models\EnrolmentAcademicContext;
use App\Models\Student;
use App\Services\Academics\DeliveryLinkRegister;
use App\Services\Academics\OfficialPlacementRegister;
use App\Services\Academics\PlacementCsvRow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Support\AcademicAccess;
use Tests\Support\BuildsPlacementScenario;
use Tests\TestCase;

final class EnrolmentContextEligibilityTest extends TestCase
{
    use AcademicAccess, BuildsPlacementScenario, RefreshDatabase;

    public function test_new_context_is_forbidden_after_withdrawal_and_an_existing_receipt_can_be_replayed(): void
    {
        $this->travelTo('2026-06-10 10:00:00');
        $registrar = $this->academicUser('registrar');
        $operator = $this->academicUser();
        $student = Student::factory()->create();
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $row = $this->placementRow($student, $pin);
        $register = app(OfficialPlacementRegister::class);
        $update = $register->queue($registrar, $row);
        $register->accept($registrar, $update);
        $assignment = $this->approvedAssignment($pin, $row->programmeLevelId);
        $linked = $this->publishedOffering($operator, $pin, $assignment);
        $unlinked = $this->publishedOffering($operator, $pin, $assignment, ['semester_id' => $linked->semester_id, 'section' => 'B']);
        $links = app(DeliveryLinkRegister::class);
        $links->link($operator, $linked, $assignment->id, 'First delivery verified');
        $links->link($operator, $unlinked, $assignment->id, 'Second delivery verified');
        $this->assertSame(1, $this->importRegistration($student, $linked));
        $this->assertSame(1, $this->importRegistration($student, $unlinked));
        $first = Enrolment::where('offering_id', $linked->id)->sole();
        $second = Enrolment::where('offering_id', $unlinked->id)->sole();
        $action = route('admin.placements.link', $update);
        $this->actingAs($registrar)->withSession(['security.mfa_user' => $registrar->id]);
        $this->post($action, ['enrolment_id' => $first->id])->assertSessionHasNoErrors()->assertRedirect();
        $receipt = EnrolmentAcademicContext::sole();

        $this->travel(1)->hour();
        $this->assertSame(1, $this->importRegistration($student, $linked, 2, EnrolmentStatus::Withdrawn));
        $this->assertSame(1, $this->importRegistration($student, $unlinked, 2, EnrolmentStatus::Withdrawn));
        $this->post($action, ['enrolment_id' => $second->id])->assertForbidden();
        $this->post($action, ['enrolment_id' => $first->id])->assertSessionHasNoErrors()->assertRedirect();

        $this->assertSame($receipt->getRawOriginal(), EnrolmentAcademicContext::sole()->getRawOriginal());
        $this->assertDatabaseMissing('enrolment_academic_contexts', ['enrolment_id' => $second->id]);
        $this->assertSame(1, $this->importRegistration($student, $unlinked, 3));
        $this->post($action, ['enrolment_id' => $second->id])->assertSessionHasErrors('enrolment_id');
        $this->assertDatabaseMissing('enrolment_academic_contexts', ['enrolment_id' => $second->id]);
    }

    public function test_pending_update_holds_only_new_applicable_links_and_preserves_exact_replay(): void
    {
        $this->travelTo('2026-06-10 10:00:00');
        $registrar = $this->academicUser('registrar');
        $operator = $this->academicUser();
        $student = Student::factory()->create();
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $row = $this->placementRow($student, $pin);
        $register = app(OfficialPlacementRegister::class);
        $update = $register->queue($registrar, $row);
        $approved = $register->accept($registrar, $update);
        $assignment = $this->approvedAssignment($pin, $row->programmeLevelId);
        $earlier = $this->publishedOffering($operator, $pin, $assignment);
        $later = $this->publishedOffering($operator, $pin, $assignment, ['semester_id' => $earlier->semester_id, 'section' => 'B']);
        $alreadyLinked = $this->publishedOffering($operator, $pin, $assignment, ['semester_id' => $earlier->semester_id, 'section' => 'C']);
        $links = app(DeliveryLinkRegister::class);
        $links->link($operator, $earlier, $assignment->id, 'First delivery verified');
        $links->link($operator, $later, $assignment->id, 'Second delivery verified');
        $links->link($operator, $alreadyLinked, $assignment->id, 'Third delivery verified');
        $this->assertSame(1, $this->importRegistration($student, $earlier));
        $this->travelTo('2026-06-20 10:00:00');
        $this->assertSame(1, $this->importRegistration($student, $later));
        $this->assertSame(1, $this->importRegistration($student, $alreadyLinked));
        $priorEnrolment = Enrolment::where('offering_id', $alreadyLinked->id)->sole();
        $this->actingAs($registrar)->withSession(['security.mfa_user' => $registrar->id]);
        $route = route('admin.placements.link', $update);
        $this->post($route, ['enrolment_id' => $priorEnrolment->id])->assertSessionHasNoErrors()->assertRedirect();
        $originalReceipt = EnrolmentAcademicContext::sole()->getRawOriginal();

        $this->travelTo('2026-06-21 10:00:00');
        $register->queue($registrar, new PlacementCsvRow(
            $row->registrationId, 2, $row->studentId, $row->pathwayId, $row->sessionId,
            $row->cohortId, $row->programmeLevelId, '2026-06-15',
        ));

        $earlierEnrolment = Enrolment::where('offering_id', $earlier->id)->sole();
        $laterEnrolment = Enrolment::where('offering_id', $later->id)->sole();
        $this->post($route, ['enrolment_id' => $earlierEnrolment->id])->assertSessionHasNoErrors()->assertRedirect();
        $this->post($route, ['enrolment_id' => $laterEnrolment->id])->assertSessionHasErrors([
            'enrolment_id' => 'An unapproved placement update could apply to this roster start. Keep this link on hold.',
        ]);

        $this->post($route, ['enrolment_id' => $priorEnrolment->id])->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame($originalReceipt, EnrolmentAcademicContext::where('enrolment_id', $priorEnrolment->id)->sole()->getRawOriginal());
        $this->assertDatabaseCount('enrolment_academic_contexts', 2);
        $this->assertDatabaseHas('enrolment_academic_contexts', [
            'enrolment_id' => $earlierEnrolment->id,
            'placement_acceptance_id' => $approved->id,
        ]);
        $this->assertDatabaseMissing('enrolment_academic_contexts', ['enrolment_id' => $laterEnrolment->id]);
    }
}
