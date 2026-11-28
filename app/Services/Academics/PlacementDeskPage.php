<?php

namespace App\Services\Academics;

use App\Enums\EnrolmentStatus;
use App\Models\PlacementUpdate;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Database\Query\Builder;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use stdClass;

/**
 * @phpstan-type QueueRow object{id: string, registration_code: string, update_number: int|string, acceptance_id: string|null, last_approved: int|string|null}
 * @phpstan-type DetailRow object{student_id: string, external_student_id: string, track: string, programme: string, session: string, cohort: string, level: string, approval_note: string|null, pinned_version: int|string|null, acceptance_id: string|null, registration_code: string, last_approved: int|string|null}
 * @phpstan-type EnrolmentRow object{id: string, external_offering_id: string|null, section: string|null, placement_acceptance_id: string|null}
 */
final class PlacementDeskPage
{
    public function __construct(private ScopedAuthority $authority) {}

    /**
     * @return array{
     *     updates: list<PlacementQueueEntry>, hasMorePages: bool, selected: PlacementDeskSelection|null,
     *     enrolments: Collection<int, PlacementEnrolmentOption>
     * }
     */
    public function read(User $actor, ?PlacementUpdate $update, int $page): array
    {
        abort_unless($this->authority->registrarAllows($actor), 403);

        /** @var Paginator<int, QueueRow> $updates */
        $updates = $this->queue()->orderByRaw('case when acceptance.id is null then 0 else 1 end')
            ->orderBy('registration.registration_code')->orderBy('updates.update_number')->orderBy('updates.id')
            ->simplePaginate(25, page: $page);
        $detail = $update === null ? null : $this->detail($update);

        return [
            'updates' => $updates->getCollection()->map($this->entry(...))->values()->all(),
            'hasMorePages' => $updates->hasMorePages(),
            'selected' => $detail === null ? null : $this->selection($update, $detail),
            'enrolments' => $detail?->acceptance_id === null ? collect() : $this->enrolments(
                $detail->student_id, $update->academic_session_id, $detail->acceptance_id,
            ),
        ];
    }

    private function queue(): Builder
    {
        return DB::table('placement_updates as updates')
            ->join('official_registrations as registration', 'registration.id', '=', 'updates.official_registration_id')
            ->leftJoin('placement_acceptances as acceptance', 'acceptance.placement_update_id', '=', 'updates.id')
            ->select(['updates.id', 'updates.update_number', 'registration.registration_code', 'acceptance.id as acceptance_id'])
            ->selectSub(
                DB::table('placement_updates as prior')
                    ->join('placement_acceptances as reviewed', 'reviewed.placement_update_id', '=', 'prior.id')
                    ->whereColumn('prior.official_registration_id', 'updates.official_registration_id')
                    ->selectRaw('max(prior.update_number)'),
                'last_approved',
            );
    }

    /** @return DetailRow */
    private function detail(PlacementUpdate $update): stdClass
    {
        return $this->queue()
            ->join('students as student', 'student.id', '=', 'registration.student_id')
            ->join('academic_pathways as pathway', 'pathway.id', '=', 'updates.academic_pathway_id')
            ->join('specializations as track', 'track.id', '=', 'pathway.specialization_id')
            ->join('academic_programmes as programme', 'programme.id', '=', 'pathway.academic_programme_id')
            ->join('academic_sessions as session', 'session.id', '=', 'updates.academic_session_id')
            ->join('entry_cohorts as cohort', 'cohort.id', '=', 'updates.entry_cohort_id')
            ->join('programme_levels as level', 'level.id', '=', 'updates.programme_level_id')
            ->leftJoin('curriculum_adoption_decisions as decision', 'decision.id', '=', 'acceptance.curriculum_adoption_decision_id')
            ->leftJoin('curricula as version', 'version.id', '=', 'decision.curriculum_id')
            ->addSelect([
                'registration.student_id', 'student.external_student_id', 'track.name as track', 'programme.name as programme',
                'session.label as session', 'cohort.label as cohort', 'level.label as level',
                'acceptance.approval_note', 'version.version as pinned_version',
            ])
            ->where('updates.id', $update->id)->firstOrFail();
    }

    /** @param QueueRow $row */
    private function entry(stdClass $row): PlacementQueueEntry
    {
        return new PlacementQueueEntry(
            $row->id,
            $row->registration_code,
            (int) $row->update_number,
            $row->acceptance_id !== null,
            (int) $row->last_approved + 1,
        );
    }

    /** @param DetailRow $detail */
    private function selection(PlacementUpdate $update, stdClass $detail): PlacementDeskSelection
    {
        $lastAccepted = (int) $detail->last_approved;
        $entry = new PlacementQueueEntry(
            $update->id, $detail->registration_code, $update->update_number, $detail->acceptance_id !== null, $lastAccepted + 1,
        );
        $previous = $entry->accepted || $lastAccepted === 0 ? null : PlacementUpdate::query()
            ->where('official_registration_id', $update->official_registration_id)
            ->where('update_number', $lastAccepted)
            ->first(['academic_pathway_id', 'entry_cohort_id']);

        return new PlacementDeskSelection(
            $entry,
            $detail->external_student_id,
            $update->effective_on->toDateString(),
            $detail->track.' · '.$detail->programme,
            $detail->session,
            $detail->cohort,
            $detail->level,
            $detail->pinned_version === null ? null : (int) $detail->pinned_version,
            $detail->approval_note,
            PlacementPin::requiresReason($update, $previous),
        );
    }

    /** @return Collection<int, PlacementEnrolmentOption> */
    private function enrolments(string $student, string $session, string $acceptance): Collection
    {
        /** @var Collection<int, EnrolmentRow> $rows */
        $rows = DB::table('enrolments as enrolment')
            ->join('offerings as offering', 'offering.id', '=', 'enrolment.offering_id')
            ->join('semesters as term', 'term.id', '=', 'offering.semester_id')
            ->leftJoin('enrolment_academic_contexts as context', 'context.enrolment_id', '=', 'enrolment.id')
            ->where('enrolment.student_id', $student)->where('term.session_id', $session)
            ->where('enrolment.status', EnrolmentStatus::Registered)
            ->orderBy('offering.external_offering_id')->orderBy('enrolment.id')
            ->get(['enrolment.id', 'offering.external_offering_id', 'offering.section', 'context.placement_acceptance_id']);

        return $rows->map(static fn (stdClass $row): PlacementEnrolmentOption => new PlacementEnrolmentOption(
            $row->id,
            $row->external_offering_id,
            $row->section,
            $row->placement_acceptance_id !== null,
            $row->placement_acceptance_id === $acceptance,
        ));
    }
}
