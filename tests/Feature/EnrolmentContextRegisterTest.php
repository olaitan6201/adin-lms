<?php

namespace Tests\Feature;

use App\Models\AcademicSession;
use App\Models\CurriculumAdoption;
use App\Models\Enrolment;
use App\Models\EnrolmentAcademicContext;
use App\Models\Offering;
use App\Models\OfferingCurriculumCourse;
use App\Models\Student;
use App\Services\Academics\DeliveryLinkRegister;
use App\Services\Academics\EnrolmentContextRegister;
use App\Services\Academics\OfficialPlacementRegister;
use App\Services\Academics\PlacementCsvRow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\Support\AcademicAccess;
use Tests\Support\BuildsPlacementScenario;
use Tests\TestCase;

final class EnrolmentContextRegisterTest extends TestCase
{
    use AcademicAccess, BuildsPlacementScenario, RefreshDatabase;

    public function test_linking_requires_verified_delivery_and_an_owned_roster_enrolment(): void
    {
        $actor = $this->academicUser('registrar');
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $student = Student::factory()->create();
        $row = $this->placementRow($student, $pin);
        $placements = app(OfficialPlacementRegister::class);
        $accepted = $placements->accept($actor, $placements->queue($actor, $row));

        $entry = $this->approvedAssignment($pin, $row->programmeLevelId);
        $offering = $this->publishedOffering($actor, $pin, $entry);
        $this->assertSame(1, $this->importRegistration($student, $offering));
        $enrolment = Enrolment::sole();
        $this->assertNull($enrolment->enrolled_at);
        try {
            app(EnrolmentContextRegister::class)->link($actor, $enrolment, $accepted);
            $this->fail('The offering needs a verified course link.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('enrolment_id', $exception->errors());
        }

        $this->assertDatabaseCount('enrolment_academic_contexts', 0);

        $this->post(route('admin.delivery-links.store', $offering), [
            'assignment' => $entry->id, 'confirmation' => 'Confirmed taught revision.',
        ])->assertForbidden();
        $this->assertNull($offering->refresh()->taught_course_revision_id);
        $this->assertDatabaseEmpty('offering_curriculum_courses');

        $deliveryActor = $this->academicUser();
        $this->get(route('admin.delivery-links.index', $offering))->assertOk();
        $this->post(route('admin.delivery-links.store', $offering), [
            'assignment' => $entry->id, 'confirmation' => 'Confirmed taught revision.',
        ])->assertSessionHasNoErrors()->assertRedirect(route('admin.delivery-links.index', $offering));
        $association = OfferingCurriculumCourse::sole();
        $this->assertSame($deliveryActor->id, $association->linked_by);
        $this->assertSame($entry->course_revision_id, $offering->fresh()->taught_course_revision_id);

        $wrongStudent = Enrolment::factory()->for($offering)->create();
        $localOnly = Enrolment::factory()->for($student)->create();
        $params = ['enrolment_id' => $enrolment->id];
        $route = route('admin.placements.link', $accepted->placement_update_id);
        $this->post($route, $params)->assertForbidden();
        $this->actingAs($actor)->withSession(['security.mfa_user' => $actor->id]);
        $this->post($route, ['enrolment_id' => $wrongStudent->id])->assertForbidden();
        $this->assertDatabaseEmpty('enrolment_academic_contexts');
        $this->post($route, ['enrolment_id' => $localOnly->id])->assertSessionHasErrors([
            'enrolment_id' => 'Use a school roster enrolment with a recorded start and offering ID.',
        ])->assertSessionDoesntHaveErrors('enrolment');
        $this->post($route, ['enrolment_id' => (string) Str::uuid7()])->assertSessionHasErrors([
            'enrolment_id' => 'Choose an enrolment that still exists.',
        ]);
        $this->assertDatabaseEmpty('enrolment_academic_contexts');
    }

    #[TestWith([false])]
    #[TestWith([true])]
    public function test_linking_is_explicit_and_does_not_change_enrolment_identity_or_move_the_pin(bool $acrossSessions): void
    {
        $this->travelTo(now()->startOfYear()->addMonths(4)->setHour(9));
        $actor = $this->academicUser('registrar');
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $student = Student::factory()->create();
        $row = $this->placementRow($student, $pin);
        $placements = app(OfficialPlacementRegister::class);
        $accepted = $placements->accept($actor, $placements->queue($actor, $row));

        $entry = $this->approvedAssignment($pin, $row->programmeLevelId);
        $operator = $this->academicUser();
        $offering = $this->publishedOffering($operator, $pin, $entry);
        $association = app(DeliveryLinkRegister::class)->link($operator, $offering, $entry->id, 'Confirmed taught revision.');
        $this->assertSame(1, $this->importRegistration($student, $offering));
        $enrolment = Enrolment::sole();
        $before = $enrolment->getRawOriginal();
        $params = ['enrolment_id' => $enrolment->id];
        $route = route('admin.placements.link', $accepted->placement_update_id);
        $this->actingAs($actor)->withSession(['security.mfa_user' => $actor->id]);

        $destination = $this->transferPin($row, $acrossSessions ? AcademicSession::factory()->create()->id : null);
        $transfer = $this->placementRow($student, $destination, $row->registrationId, 2, now()->toDateString());
        $this->travel(1)->hour();
        $tiedOffering = Offering::factory()->create(['semester_id' => $offering->semester_id, 'section' => 'B']);
        $second = now()->toImmutable()->startOfSecond();
        $this->travelTo($second->microsecond(100000));
        $this->assertSame(1, $this->importRegistration($student, $tiedOffering));
        $tiedEnrolment = Enrolment::where('offering_id', $tiedOffering->id)->sole();
        $this->travelTo($second->microsecond(800000));
        $transferUpdate = $placements->queue($actor, $transfer);
        $placements->accept($actor, $transferUpdate, 'Approved transfer TR-2');
        $tied = ['enrolment_id' => $tiedEnrolment->id];
        $tie = ['enrolment_id' => 'The roster start and transfer approval were recorded in the same second. Keep this link on hold.'];
        $this->post(route('admin.placements.link', $transferUpdate), $tied)->assertSessionHasErrors($tie);
        $this->post($route, $tied)->assertSessionHasErrors($tie);
        $this->post(route('admin.placements.link', $transferUpdate), $params)->assertSessionHasErrors([
            'enrolment_id' => 'The selected placement is not the only one that applied when this enrolment started.',
        ]);
        $this->post($route, $params)->assertSessionHasNoErrors()->assertRedirect();
        $context = EnrolmentAcademicContext::sole();

        $this->assertTrue(Str::isUuid($context->id, 7));
        $this->assertSame($association->id, $context->offering_curriculum_course_id);
        $this->assertSame($accepted->id, $context->placement_acceptance_id);
        $this->assertSame($context->id, app(EnrolmentContextRegister::class)->link($actor, $enrolment, $accepted)->id);
        $this->assertSame($before, $enrolment->fresh()->getRawOriginal());
        $this->assertDatabaseCount('enrolment_academic_contexts', 1);

        $competing = new PlacementCsvRow(
            'SCHOOL-0002', 1, $row->studentId, $row->pathwayId, $row->sessionId,
            $row->cohortId, $row->programmeLevelId, $row->effectiveOn,
        );
        $other = $placements->accept($actor, $placements->queue($actor, $competing));
        $this->post(route('admin.placements.link', $other->placement_update_id), $params)->assertSessionHasErrors('enrolment_id');
        $this->assertSame($context->id, EnrolmentAcademicContext::sole()->id);
    }
}
