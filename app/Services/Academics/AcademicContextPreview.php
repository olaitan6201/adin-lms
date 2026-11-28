<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use App\Enums\DeliveryLinkEvidenceStatus;
use App\Enums\EnrolmentStatus;
use App\Enums\OfferingStatus;
use App\Enums\StructureRegisterStatus;
use App\Models\AcademicPathway;
use App\Models\AcademicSession;
use App\Models\CurriculumAdoptionDecision;
use App\Models\Enrolment;
use App\Models\EntryCohort;
use App\Models\ProgrammeLevel;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;
use stdClass;

final class AcademicContextPreview
{
    /** Preview a first placement only; never use an operative adoption to replace an accepted pin. */
    public function initialAdoption(
        AcademicPathway $pathway,
        AcademicSession $session,
        EntryCohort $cohort,
        ProgrammeLevel $level,
        bool $lock = false,
    ): ?CurriculumAdoptionDecision {
        return CurriculumAdoptionDecision::query()
            ->join('curriculum_adoptions as adoption', 'adoption.active_decision_id', '=', 'curriculum_adoption_decisions.id')
            ->join('curricula as version', 'version.id', '=', 'curriculum_adoption_decisions.curriculum_id')
            ->join('academic_pathways as pathway', 'pathway.id', '=', 'adoption.academic_pathway_id')
            ->join('programme_levels as level', 'level.academic_programme_id', '=', 'pathway.academic_programme_id')
            ->where('pathway.id', $pathway->id)
            ->where('pathway.status', StructureRegisterStatus::Active)
            ->where('adoption.academic_session_id', $session->id)
            ->where('adoption.entry_cohort_id', $cohort->id)
            ->where('level.id', $level->id)
            ->where('version.status', CurriculumStatus::Approved)
            ->whereNotNull('version.approved_at')
            ->whereNotNull('version.approved_by')
            ->when($lock, fn (EloquentBuilder $query): EloquentBuilder => $query->lockForUpdate())
            ->first(['curriculum_adoption_decisions.*']);
    }

    /** Preview an exact existing offering link without inferring equivalence or changing the supplied pin. */
    public function enrolmentAssociation(
        Enrolment $enrolment,
        Student $student,
        CurriculumAdoptionDecision $pin,
        ?string $placementSession = null,
        bool $lock = false,
    ): ?string {
        $matches = DB::table('enrolments as enrolment')
            ->join('offerings as offering', 'offering.id', '=', 'enrolment.offering_id')
            ->join('semesters as semester', 'semester.id', '=', 'offering.semester_id')
            ->join('offering_curriculum_courses as link', 'link.offering_id', '=', 'offering.id')
            ->join('curriculum_courses as assignment', 'assignment.id', '=', 'link.curriculum_course_id')
            ->join('course_revisions as revision', 'revision.id', '=', 'assignment.course_revision_id')
            ->join('curricula as version', 'version.id', '=', 'assignment.curriculum_id')
            ->join('curriculum_adoption_decisions as decision', 'decision.curriculum_id', '=', 'version.id')
            ->where('enrolment.id', $enrolment->id)
            ->where('enrolment.student_id', $student->id)
            ->where('enrolment.status', EnrolmentStatus::Registered)
            ->where('offering.status', OfferingStatus::Published)
            ->where('decision.id', $pin->id)
            ->whereNotNull('link.linked_by')
            ->whereNotNull('link.confirmation_note')
            ->whereNotNull('link.confirmed_at')
            ->where('semester.session_id', $placementSession ?? $pin->academic_session_id)
            ->whereColumn('offering.taught_course_revision_id', 'revision.id')
            ->where('revision.status', CurriculumStatus::Approved)
            ->whereNotNull('revision.approved_at')
            ->whereNotNull('revision.approved_by')
            ->where('version.status', CurriculumStatus::Approved)
            ->whereNotNull('version.approved_at')
            ->whereNotNull('version.approved_by')
            ->when($lock, fn (QueryBuilder $query): QueryBuilder => $query->lockForUpdate())
            ->limit(2)->get(['link.id', 'link.linked_by', 'link.confirmation_note', 'link.confirmed_at']);

        /** @var (object{id: string, linked_by: mixed, confirmation_note: mixed, confirmed_at: mixed}&stdClass)|null $link */
        $link = $matches->first();
        if ($link === null || $matches->count() !== 1
            || ! is_string($link->linked_by) || ! is_string($link->confirmation_note) || ! is_string($link->confirmed_at)) {
            return null;
        }

        $evidence = DeliveryLinkAttestation::status($link->linked_by, $link->confirmation_note, $link->confirmed_at);

        return $evidence === DeliveryLinkEvidenceStatus::Confirmed ? $link->id : null;
    }
}
