<?php

namespace App\Services\Academics;

use App\Models\CurriculumAdoptionDecision;
use App\Models\Enrolment;
use App\Models\EnrolmentAcademicContext;
use App\Models\Offering;
use App\Models\OfficialRegistration;
use App\Models\PlacementAcceptance;
use App\Models\PlacementUpdate;
use App\Models\Student;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use App\Services\Roster\RegistrationInterval;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

final class EnrolmentContextRegister
{
    public function __construct(
        private ScopedAuthority $authority,
        private AcademicContextPreview $preview,
        private PlacementUpdateOrder $order,
    ) {}

    public function linkUpdate(User $actor, PlacementUpdate $update, string $enrolment): EnrolmentAcademicContext
    {
        if (! $this->authority->registrarAllows($actor)) {
            throw new AuthorizationException;
        }

        $target = Enrolment::find(strtolower($enrolment))
            ?? $this->reject('Choose an enrolment that still exists.');

        return $this->record($actor, $target, $update->id);
    }

    public function link(User $actor, Enrolment $target, PlacementAcceptance $acceptance): EnrolmentAcademicContext
    {
        if (! $this->authority->registrarAllows($actor)) {
            throw new AuthorizationException;
        }

        return $this->record($actor, $target, $acceptance->placement_update_id, $acceptance->id);
    }

    private function record(User $actor, Enrolment $target, string $placementId, ?string $acceptanceId = null): EnrolmentAcademicContext
    {
        $placement = PlacementUpdate::findOrFail($placementId);
        $owner = OfficialRegistration::findOrFail($placement->official_registration_id);

        return DB::transaction(function () use ($actor, $target, $placement, $owner, $acceptanceId): EnrolmentAcademicContext {
            $student = Student::lockForUpdate()->findOrFail($owner->student_id);
            $offering = Offering::lockForUpdate()->findOrFail($target->offering_id);
            $enrolment = Enrolment::lockForUpdate()->find($target->id)
                ?? $this->reject('Choose an enrolment that still exists.');
            $policy = Gate::forUser($actor);
            $subject = [$enrolment, $owner, $offering];
            $policy->authorize('replayPlacement', $subject);

            $accepted = $placement->acceptance()->lockForUpdate()->first();
            if ($accepted === null || ($acceptanceId !== null && $accepted->id !== $acceptanceId)) {
                throw ValidationException::withMessages(['placement' => 'Approve the placement before linking an enrolment.']);
            }

            $existing = EnrolmentAcademicContext::where('enrolment_id', $enrolment->id)->lockForUpdate()->first();
            if ($existing !== null) {
                if ($existing->placement_acceptance_id !== $accepted->id) {
                    $this->reject('This enrolment already has a placement link.');
                }

                return $existing;
            }

            $policy->authorize('linkPlacement', $subject);
            $start = RegistrationInterval::firstImportedStart($enrolment);
            if (blank($offering->external_offering_id) || $start === null || $start->isFuture()) {
                $this->reject('Use a school roster enrolment with a recorded start and offering ID.');
            }

            $this->ensurePlacementApplies($placement, $student, $start);

            $pin = CurriculumAdoptionDecision::lockForUpdate()->findOrFail($accepted->curriculum_adoption_decision_id);
            $association = $this->preview->enrolmentAssociation($enrolment, $student, $pin, $placement->academic_session_id, lock: true);
            if ($association === null) {
                $this->reject('The offering needs an exact course link to the approved curriculum.');
            }

            return EnrolmentAcademicContext::create([
                'enrolment_id' => $enrolment->id,
                'offering_id' => $enrolment->offering_id,
                'offering_curriculum_course_id' => $association,
                'placement_acceptance_id' => $accepted->id,
                'linked_by' => $actor->id,
            ]);
        }, 3);
    }

    private function ensurePlacementApplies(PlacementUpdate $placement, Student $student, CarbonImmutable $start): void
    {
        $history = $this->history($student, $start)
            ->orderBy('placement_updates.update_number')->lockForUpdate()
            ->get([
                'placement_updates.id', 'official_registration_id', 'update_number', 'academic_session_id',
                'academic_pathway_id', 'entry_cohort_id', 'effective_on',
            ]);
        $receipts = PlacementAcceptance::query()
            ->join('placement_updates', 'placement_updates.id', '=', 'placement_acceptances.placement_update_id')
            ->join('official_registrations', 'official_registrations.id', '=', 'placement_updates.official_registration_id')
            ->where('official_registrations.student_id', $student->id)
            ->whereDate('placement_updates.effective_on', '<=', $start->toDateString())
            ->lockForUpdate()->get(['placement_update_id', 'approved_at', 'effective_at'])->keyBy('placement_update_id');

        $hold = $this->order->linkHold($placement, $history, $receipts, $start, now()->toImmutable());
        if ($hold !== null) {
            $this->reject($hold);
        }
    }

    /** @return Builder<PlacementUpdate> */
    private function history(Student $student, CarbonImmutable $start): Builder
    {
        return PlacementUpdate::query()
            ->join('official_registrations', 'official_registrations.id', '=', 'placement_updates.official_registration_id')
            ->where('official_registrations.student_id', $student->id)
            ->whereDate('placement_updates.effective_on', '<=', $start->toDateString());
    }

    private function reject(string $reason): never
    {
        throw ValidationException::withMessages(['enrolment_id' => $reason]);
    }
}
