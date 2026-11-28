<?php

namespace App\Services\Academics;

use App\Enums\PlacementUpdateDisposition;
use App\Models\AcademicPathway;
use App\Models\AcademicSession;
use App\Models\EntryCohort;
use App\Models\OfficialRegistration;
use App\Models\PlacementAcceptance;
use App\Models\PlacementUpdate;
use App\Models\ProgrammeLevel;
use App\Models\Student;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class OfficialPlacementRegister
{
    public function __construct(
        private ScopedAuthority $authority,
        private PlacementPin $pins,
        private PlacementUpdateOrder $order,
    ) {}

    /** @param list<PlacementCsvRow> $rows */
    public function upload(User $actor, array $rows): void
    {
        $this->authorize($actor);

        DB::transaction(function () use ($actor, $rows): void {
            foreach ($rows as $index => $row) {
                try {
                    $this->queue($actor, $row);
                } catch (ValidationException $error) {
                    $line = $index + 2;

                    throw ValidationException::withMessages(['file' => "Row $line: ".$error->getMessage()]);
                }
            }
        }, 3);
    }

    public function queue(User $actor, PlacementCsvRow $row): PlacementUpdate
    {
        $this->authorize($actor);

        if (! PlacementCsvRow::validUpdateNumber($row->updateNumber)) {
            $this->hold('The update number must be between 1 and 999999999.');
        }

        if (! $row->hasCalendarDate()) {
            $this->hold('Use a valid start date in YYYY-MM-DD format.');
        }

        return DB::transaction(function () use ($actor, $row): PlacementUpdate {
            $student = Student::where('external_student_id', $row->studentId)->lockForUpdate()->first();
            if ($student?->external_student_id !== $row->studentId
                || ! AcademicPathway::whereKey($row->pathwayId)->exists()
                || ! AcademicSession::whereKey($row->sessionId)->exists()
                || ! EntryCohort::whereKey($row->cohortId)->exists()
                || ! ProgrammeLevel::whereKey($row->programmeLevelId)->exists()) {
                $this->hold('Use a student and academic records already confirmed in the LMS.');
            }

            $registration = OfficialRegistration::lockForUpdate()->firstOrCreate(
                ['registration_key' => hash('sha256', 'registrar_csv:'.$row->registrationId)],
                ['registration_code' => $row->registrationId, 'student_id' => $student->id],
            );
            if ($registration->registration_code !== $row->registrationId || $registration->student_id !== $student->id) {
                $this->hold('This registration already belongs to a different student.');
            }

            $fields = [
                'academic_pathway_id' => $row->pathwayId,
                'academic_session_id' => $row->sessionId,
                'entry_cohort_id' => $row->cohortId,
                'programme_level_id' => $row->programmeLevelId,
                'effective_on' => $row->effectiveOn,
            ];
            $update = PlacementUpdate::lockForUpdate()->firstOrCreate(
                ['official_registration_id' => $registration->id, 'update_number' => $row->updateNumber],
                $fields + ['submitted_by' => $actor->id],
            );
            $stored = [
                'academic_pathway_id' => $update->academic_pathway_id,
                'academic_session_id' => $update->academic_session_id,
                'entry_cohort_id' => $update->entry_cohort_id,
                'programme_level_id' => $update->programme_level_id,
                'effective_on' => $update->effective_on->toDateString(),
            ];
            if ($stored !== $fields) {
                $this->hold('This update number already has different details.');
            }

            return $update;
        }, 3);
    }

    public function accept(User $actor, PlacementUpdate $update, ?string $note = null): PlacementAcceptance
    {
        $this->authorize($actor);
        $owner = OfficialRegistration::findOrFail($update->official_registration_id);

        return DB::transaction(function () use ($actor, $update, $note, $owner): PlacementAcceptance {
            Student::lockForUpdate()->findOrFail($owner->student_id);
            $registration = OfficialRegistration::lockForUpdate()->findOrFail($update->official_registration_id);
            $row = PlacementUpdate::where('official_registration_id', $registration->id)->lockForUpdate()->findOrFail($update->id);
            if ($existing = $row->acceptance()->lockForUpdate()->first()) {
                return $existing;
            }

            $previous = PlacementUpdate::where('placement_updates.official_registration_id', $registration->id)
                ->join('placement_acceptances as accepted', 'accepted.placement_update_id', '=', 'placement_updates.id')
                ->orderByDesc('placement_updates.update_number')->lockForUpdate()
                ->first(['placement_updates.*']);

            if ($this->order->next($row->update_number, $previous?->update_number ?? 0) !== PlacementUpdateDisposition::ReadyForReview) {
                $this->hold('Review the missing earlier update first.');
            }

            [$pin, $approvedAt, $effectiveAt] = $this->pins->resolve($row, $previous, $note);

            return $row->acceptance()->create([
                'curriculum_adoption_decision_id' => $pin->id,
                'approved_by' => $actor->id,
                'approved_at' => $approvedAt,
                'effective_at' => $effectiveAt,
                'approval_note' => $note,
            ]);
        }, 3);
    }

    private function authorize(User $actor): void
    {
        if (! $this->authority->registrarAllows($actor)) {
            throw new AuthorizationException;
        }
    }

    private function hold(string $reason): never
    {
        throw ValidationException::withMessages(['placement' => $reason]);
    }
}
