<?php

namespace Tests\Feature;

use App\Enums\RosterAuditAction;
use App\Enums\RosterStartProvenance;
use App\Models\AuditLog;
use App\Models\CurriculumAdoption;
use App\Models\Enrolment;
use App\Models\Student;
use App\Services\Academics\DeliveryLinkRegister;
use App\Services\Academics\OfficialPlacementRegister;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\Support\AcademicAccess;
use Tests\Support\BuildsPlacementScenario;
use Tests\TestCase;

final class EnrolmentContextProvenanceTest extends TestCase
{
    use AcademicAccess, BuildsPlacementScenario, RefreshDatabase;

    #[TestWith([false], 'legacy metadata only')]
    #[TestWith([true], 'pre-existing ambiguous start event')]
    public function test_reaffirmed_legacy_registration_stays_unlinked_after_a_transfer(bool $hasLegacyEvent): void
    {
        $this->travelTo('2026-02-03 12:34:56');
        $registrar = $this->academicUser('registrar');
        $operator = $this->academicUser();
        $student = Student::factory()->create();
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $row = $this->placementRow($student, $pin);
        $placements = app(OfficialPlacementRegister::class);
        $first = $placements->queue($registrar, $row);
        $placements->accept($registrar, $first);

        $originalCourse = $this->approvedAssignment($pin, $row->programmeLevelId);
        $originalOffering = $this->publishedOffering($operator, $pin, $originalCourse);
        $links = app(DeliveryLinkRegister::class);
        $links->link($operator, $originalOffering, $originalCourse->id, 'Original taught revision verified');
        $legacy = Enrolment::factory()->for($student)->for($originalOffering)->create(['enrolled_at' => null]);
        if ($hasLegacyEvent) {
            AuditLog::forceCreate([
                'subject_key' => $legacy->id,
                'action' => RosterAuditAction::RegistrationStarted->value,
                'occurred_at' => now(),
                'details' => ['source_revision' => 2],
            ]);
            $legacy->forceFill(['source_revision' => 2])->save();
        }

        $this->travelTo('2026-11-20 12:00:00');
        $destination = $this->transferPin($row);
        $transfer = $placements->queue($registrar, $this->placementRow(
            $student, $destination, $row->registrationId, 2, '2026-11-20',
        ));
        $destinationApproval = $placements->accept($registrar, $transfer, 'Official pathway transfer');
        $destinationCourse = $this->approvedAssignment($destination, $transfer->programme_level_id);
        $destinationOffering = $this->publishedOffering($operator, $destination, $destinationCourse, [
            'semester_id' => $originalOffering->semester_id,
            'section' => 'B',
        ]);
        $association = $links->link($operator, $destinationOffering, $destinationCourse->id, 'Destination taught revision verified');
        $this->travelTo('2026-11-20 12:01:00');

        $this->assertSame(1, $this->importRegistration($student, $originalOffering, 3));
        $this->assertSame(1, $this->importRegistration($student, $destinationOffering));
        $this->assertSame(3, (int) $legacy->refresh()->source_revision);
        $new = Enrolment::where('offering_id', $destinationOffering->id)->sole();

        $this->actingAs($registrar)->withSession(['security.mfa_user' => $registrar->id]);
        $this->post(route('admin.placements.link', $transfer), ['enrolment_id' => $new->id])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.placements.index', $transfer));
        $this->assertDatabaseHas('enrolment_academic_contexts', [
            'enrolment_id' => $new->id,
            'placement_acceptance_id' => $destinationApproval->id,
            'offering_curriculum_course_id' => $association->id,
        ]);

        foreach ([$first, $transfer] as $placement) {
            $response = $this->post(route('admin.placements.link', $placement), ['enrolment_id' => $legacy->id]);
            $this->assertDatabaseMissing('enrolment_academic_contexts', ['enrolment_id' => $legacy->id]);
            $response->assertSessionHasErrors('enrolment_id')->assertSessionDoesntHaveErrors('enrolment');
        }
        $this->assertDatabaseCount('enrolment_academic_contexts', 1);
    }

    public function test_malformed_marked_roster_start_holds_new_link_without_changing_audit_history(): void
    {
        $this->travelTo('2026-06-15 11:00:00');
        $registrar = $this->academicUser('registrar');
        $operator = $this->academicUser();
        $student = Student::factory()->create();
        $pin = CurriculumAdoption::factory()->create()->activeDecision;
        $row = $this->placementRow($student, $pin);
        $placements = app(OfficialPlacementRegister::class);
        $update = $placements->queue($registrar, $row);
        $placements->accept($registrar, $update);
        $assignment = $this->approvedAssignment($pin, $row->programmeLevelId);
        $offering = $this->publishedOffering($operator, $pin, $assignment);
        app(DeliveryLinkRegister::class)->link($operator, $offering, $assignment->id, 'Exact taught revision verified');
        $this->assertSame(1, $this->importRegistration($student, $offering));
        $enrolment = Enrolment::sole();
        $starts = AuditLog::where('subject_key', $enrolment->id)->where('action', RosterAuditAction::RegistrationStarted->value);
        $event = $starts->sole();
        $details = $event->details;
        $this->assertSame(RosterStartProvenance::InitialImport->value, $details['start_provenance']);
        $this->assertSame('2026-06-15T11:00:00+00:00', $details['observed_start_at']);
        $route = route('admin.placements.link', $update);
        $this->actingAs($registrar)->withSession(['security.mfa_user' => $registrar->id]);
        $malformed = ['unusable timestamp'];
        // PostgreSQL JSONB rejects U+0000 before it can reach the application.
        if (DB::connection()->getDriverName() !== 'pgsql') {
            $malformed[] = $details['observed_start_at']."\0";
        }

        foreach ($malformed as $instant) {
            $details['observed_start_at'] = $instant;
            DB::table('audit_logs')->where('id', $event->id)->update(['details' => json_encode($details, JSON_THROW_ON_ERROR)]);
            $retained = $starts->sole();
            $this->assertSame($instant, $retained->details['observed_start_at']);
            $this->post($route, ['enrolment_id' => $enrolment->id])
                ->assertRedirect()
                ->assertSessionHasErrors('enrolment_id');

            $this->assertSame($retained->getRawOriginal(), $starts->sole()->getRawOriginal());
            $this->assertDatabaseEmpty('enrolment_academic_contexts');
        }

        DB::table('audit_logs')->where('id', $event->id)->update(['details' => $event->getRawOriginal('details')]);
        $this->post($route, ['enrolment_id' => $enrolment->id])->assertRedirect()->assertSessionHasNoErrors();
        $this->assertDatabaseHas('enrolment_academic_contexts', ['enrolment_id' => $enrolment->id]);
    }
}
