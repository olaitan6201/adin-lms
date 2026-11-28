<?php

namespace Tests\Feature;

use App\Models\CurriculumAdoption;
use App\Models\CurriculumCourse;
use App\Models\Offering;
use App\Models\OfferingCurriculumCourse;
use App\Models\User;
use App\Services\Academics\DeliveryLinkRegister;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\Support\BuildsPlacementScenario;
use Tests\TestCase;

final class DeliveryLinkHistoryTest extends TestCase
{
    use AcademicAccess, BuildsPlacementScenario, RefreshDatabase;

    public function test_immutable_invalid_legacy_attestation_is_not_reported_as_a_successful_replay(): void
    {
        [$operator, $offering, $assignment] = $this->historicalLink('   ');

        $this->assertHistoryIsBlockedWithoutWrites($operator, $offering, $assignment);
    }

    public function test_noncanonical_stored_confirmation_instants_are_blocked_without_writes(): void
    {
        [$operator, $offering, $assignment] = $this->historicalLink('Original evidence');
        $link = DB::table('offering_curriculum_courses')->where('offering_id', $offering->id);
        // The typed server columns cannot store these malformed values; a missing instant remains invalid.
        $invalidInstants = DB::connection()->getDriverName() === 'sqlite'
            ? ["2026-11-28 10:11:12\0", '2026-11-28 10:11:12 now']
            : [null];

        foreach ($invalidInstants as $instant) {
            $this->assertSame(1, $link->update(['confirmed_at' => $instant]));
            $this->assertSame($instant, (clone $link)->value('confirmed_at'));
            $this->assertHistoryIsBlockedWithoutWrites($operator, $offering, $assignment);
        }
    }

    /** @return array{User, Offering, CurriculumCourse} */
    private function historicalLink(string $note): array
    {
        $operator = $this->academicUser();
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $assignment = $this->approvedAssignment($pin);
        $offering = $this->publishedOffering($operator, $pin, $assignment, [
            'taught_course_revision_id' => $assignment->course_revision_id,
        ]);
        DB::table('offering_curriculum_courses')->insert([
            'id' => (string) Str::uuid7(),
            'offering_id' => $offering->id,
            'curriculum_course_id' => $assignment->id,
            'linked_by' => $operator->id,
            'confirmation_note' => $note,
            'confirmed_at' => now(),
        ]);

        return [$operator, $offering, $assignment];
    }

    private function assertHistoryIsBlockedWithoutWrites(
        User $operator,
        Offering $offering,
        CurriculumCourse $assignment,
    ): void {
        $original = OfferingCurriculumCourse::sole()->getRawOriginal();
        $pinBefore = $offering->refresh()->getRawOriginal();

        try {
            app(DeliveryLinkRegister::class)->link($operator, $offering, $assignment->id, 'Replacement evidence');
            $error = null;
        } catch (ValidationException $exception) {
            $error = $exception;
        }

        $this->assertSame($original, OfferingCurriculumCourse::sole()->getRawOriginal());
        $this->assertSame($pinBefore, $offering->refresh()->getRawOriginal());
        $this->assertInstanceOf(ValidationException::class, $error, 'Invalid immutable history must stay on hold, not report a successful replay.');
        $this->assertArrayHasKey('assignment', $error->errors());

        $this->post(route('admin.delivery-links.store', $offering), [
            'assignment' => $assignment->id,
            'confirmation' => 'Replacement evidence',
        ])->assertSessionHasErrors('assignment');

        $this->assertSame($original, OfferingCurriculumCourse::sole()->getRawOriginal());
        $this->assertSame($pinBefore, $offering->refresh()->getRawOriginal());

        $this->get(route('admin.delivery-links.index', $offering))->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('candidates.0.id', $assignment->id)
                ->where('candidates.0.linked', false)
                ->where('candidates.0.blocked', true)
                ->where('candidates.0.note', null)
                ->etc());
    }

    public function test_valid_confirmation_replays_without_replacing_the_evidence(): void
    {
        $operator = $this->academicUser();
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $assignment = $this->approvedAssignment($pin);
        $offering = $this->publishedOffering($operator, $pin, $assignment);
        $service = app(DeliveryLinkRegister::class);
        $confirmed = $service->link($operator, $offering, $assignment->id, 'Original evidence')->refresh();
        $original = $confirmed->getRawOriginal();

        $this->travel(1)->hour();
        $replay = $service->link($operator, $offering, $assignment->id, 'Different replay note');

        $this->assertSame($confirmed->id, $replay->id);
        $this->assertSame($original, OfferingCurriculumCourse::sole()->getRawOriginal());
        $this->get(route('admin.delivery-links.index', $offering))->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('candidates.0.id', $assignment->id)
                ->where('candidates.0.linked', true)
                ->where('candidates.0.blocked', false)
                ->where('candidates.0.note', 'Original evidence')
                ->etc());
    }
}
