<?php

namespace Tests\Feature;

use App\Models\CurriculumAdoption;
use App\Models\Offering;
use App\Services\Academics\DeliveryLinkRegister;
use Illuminate\Auth\Access\Events\GateEvaluated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\Support\AcademicAccess;
use Tests\Support\BuildsPlacementScenario;
use Tests\TestCase;

final class DeliveryLinkRegisterTest extends TestCase
{
    use AcademicAccess, BuildsPlacementScenario, RefreshDatabase;

    public function test_delivery_authorization_is_evaluated_for_the_selected_offering(): void
    {
        $operator = $this->academicUser();
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $assignment = $this->approvedAssignment($pin);
        $selected = $this->publishedOffering($operator, $pin, $assignment);
        $other = $this->publishedOffering($operator, $pin, $assignment, [
            'semester_id' => $selected->semester_id,
            'section' => 'B',
        ]);
        $inspected = [];
        Event::listen(GateEvaluated::class, function (GateEvaluated $event) use ($operator, &$inspected): void {
            $subject = $event->arguments[0] ?? null;
            if ($event->user?->getAuthIdentifier() === $operator->id && $event->result === true && $subject instanceof Offering) {
                $inspected[$subject->id] = $subject->external_offering_id;
            }
        });

        $index = route('admin.delivery-links.index', $selected);
        $this->get($index)->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->where('selected.id', $selected->id)->where('candidates.0.id', $assignment->id)->etc());
        $this->assertSame([$selected->id => $selected->external_offering_id], $inspected, 'Reading must authorize the selected offering.');

        $inspected = [];
        $this->post(route('admin.delivery-links.store', $selected), [
            'assignment' => $assignment->id,
            'confirmation' => 'Exact taught revision verified',
        ])->assertSessionHasNoErrors()->assertRedirect($index);
        $this->assertSame([$selected->id => $selected->external_offering_id], $inspected, 'Writing must authorize the selected offering.');
        $this->assertDatabaseHas('offering_curriculum_courses', [
            'offering_id' => $selected->id,
            'curriculum_course_id' => $assignment->id,
            'linked_by' => $operator->id,
        ]);
        $this->assertDatabaseCount('offering_curriculum_courses', 1);
        $this->assertNull($other->refresh()->taught_course_revision_id);

        $inspected = [];
        $currentId = $other->external_offering_id;
        $other->forceFill(['external_offering_id' => 'Unpersisted stale value']);
        $linked = app(DeliveryLinkRegister::class)->link($operator, $other, $assignment->id, 'Second offering verified');
        $this->assertSame($other->id, $linked->offering_id);
        $this->assertSame([$other->id => $currentId], $inspected, 'Direct writes must authorize the freshly loaded offering.');
    }

    #[TestWith([''])]
    #[TestWith([" \t "])]
    public function test_direct_service_rejects_blank_evidence_without_pinning_or_linking(string $note): void
    {
        $operator = $this->academicUser();
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $assignment = $this->approvedAssignment($pin);
        $offering = $this->publishedOffering($operator, $pin, $assignment);

        try {
            app(DeliveryLinkRegister::class)->link($operator, $offering, $assignment->id, $note);
            $error = null;
        } catch (ValidationException $exception) {
            $error = $exception;
        }

        $this->assertNull($offering->refresh()->taught_course_revision_id, 'Invalid evidence must not pin the offering.');
        $this->assertDatabaseEmpty('offering_curriculum_courses');
        $this->assertInstanceOf(ValidationException::class, $error);
        $this->assertArrayHasKey('confirmation', $error->errors());
    }

    public function test_a_published_legacy_offering_with_blank_upstream_id_is_not_selectable(): void
    {
        $operator = $this->academicUser();
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $assignment = $this->approvedAssignment($pin);
        $valid = $this->publishedOffering($operator, $pin, $assignment);
        $unsupported = $this->publishedOffering($operator, $pin, $assignment, [
            'external_offering_id' => '   ',
            'semester_id' => $valid->semester_id,
            'section' => 'B',
        ]);

        $this->assertSame('   ', $unsupported->refresh()->external_offering_id);
        $this->get(route('admin.delivery-links.index', $valid))->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('selected.id', $valid->id)
                ->where('candidates.0.id', $assignment->id)
                ->etc());
        $this->get(route('admin.delivery-links.index', $unsupported))->assertNotFound();
        $this->get(route('admin.delivery-links.index'))->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('offerings', 1)->where('offerings.0.id', $valid->id)->etc());
    }
}
