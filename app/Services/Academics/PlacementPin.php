<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use App\Enums\StructureRegisterStatus;
use App\Models\AcademicPathway;
use App\Models\AcademicSession;
use App\Models\CurriculumAdoptionDecision;
use App\Models\EntryCohort;
use App\Models\PlacementUpdate;
use App\Models\ProgrammeLevel;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class PlacementPin
{
    public function __construct(private AcademicContextPreview $preview) {}

    public static function requiresReason(PlacementUpdate $row, ?PlacementUpdate $previous): bool
    {
        return $previous !== null && (
            $previous->academic_pathway_id !== $row->academic_pathway_id
            || $previous->entry_cohort_id !== $row->entry_cohort_id
        );
    }

    /** @return array{CurriculumAdoptionDecision, CarbonImmutable, CarbonImmutable} Pin, approval time and effective time. */
    public function resolve(
        PlacementUpdate $row,
        ?PlacementUpdate $previous,
        ?string $note,
    ): array {
        $pathway = AcademicPathway::lockForUpdate()->findOrFail($row->academic_pathway_id);
        $session = AcademicSession::lockForUpdate()->findOrFail($row->academic_session_id);
        $level = ProgrammeLevel::lockForUpdate()->findOrFail($row->programme_level_id);
        if ($pathway->status !== StructureRegisterStatus::Active
            || ! $row->effective_on->betweenIncluded($session->starts_on, $session->ends_on)
            || $level->academic_programme_id !== $pathway->academic_programme_id) {
            $this->hold('The start date and level must fit the selected session and active pathway.');
        }

        if ($previous !== null && $row->effective_on <= $previous->effective_on) {
            $this->hold('This start date is not after the last accepted placement. Keep it on hold.');
        }

        $transfer = self::requiresReason($row, $previous);
        if ($transfer && ($note === null || Str::trim($note) === '')) {
            throw ValidationException::withMessages(['reason' => 'Give a reason before approving a pathway or cohort change.']);
        }

        if ($note !== null && Str::length($note) > 191) {
            throw ValidationException::withMessages(['reason' => 'The reason must not exceed 191 characters.']);
        }

        $decision = $previous === null || $transfer
            ? $this->newPin($row, $pathway, $session, $level)
            : $this->previousPin($previous);

        $approvedAt = now()->toImmutable()->startOfSecond();
        if ($transfer && $row->effective_on < $approvedAt->startOfDay()) {
            $this->hold('A transfer dated before its approval day must stay on hold.');
        }

        // Roster evidence stores whole seconds, so only a later second can prove the transfer already applied.
        $effectiveAt = $transfer && $row->effective_on->isSameDay($approvedAt)
            ? $approvedAt->addSecond()
            : $row->effective_on;

        return [$decision, $approvedAt, $effectiveAt];
    }

    private function newPin(PlacementUpdate $row, AcademicPathway $pathway, AcademicSession $session, ProgrammeLevel $level): CurriculumAdoptionDecision
    {
        $cohort = EntryCohort::lockForUpdate()->findOrFail($row->entry_cohort_id);

        return $this->preview->initialAdoption($pathway, $session, $cohort, $level, lock: true)
            ?? $this->hold('No approved curriculum was adopted for this pathway, session and cohort.');
    }

    private function previousPin(PlacementUpdate $previous): CurriculumAdoptionDecision
    {
        $acceptance = $previous->acceptance()->lockForUpdate()->firstOrFail();
        $pin = CurriculumAdoptionDecision::lockForUpdate()->findOrFail($acceptance->curriculum_adoption_decision_id);
        if ($pin->curriculum()->lockForUpdate()->firstOrFail()->status !== CurriculumStatus::Approved) {
            $this->hold('The pinned curriculum is not approved.');
        }

        return $pin;
    }

    private function hold(string $reason): never
    {
        throw ValidationException::withMessages(['placement' => $reason]);
    }
}
