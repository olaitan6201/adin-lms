<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use App\Enums\DeliveryLinkEvidenceStatus;
use App\Models\CurriculumCourse;
use App\Models\Offering;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Collection;

final class DeliveryLinkCandidates
{
    public function findForConfirmation(Offering $offering, string $id): ?CurriculumCourse
    {
        return $this->eligible($offering)
            ->whereKey($id)
            ->sharedLock()
            ->first(['curriculum_courses.*']);
    }

    /** @return Collection<int, DeliveryLinkCandidate> */
    public function forOffering(Offering $offering): Collection
    {
        $rows = $this->eligible($offering)
            ->join('academic_pathways as pathways', 'pathways.id', '=', 'versions.academic_pathway_id')
            ->join('specializations as track', 'track.id', '=', 'pathways.specialization_id')
            ->join('academic_programmes as programme', 'programme.id', '=', 'pathways.academic_programme_id')
            ->leftJoin('offering_curriculum_courses as links', function (JoinClause $join) use ($offering): void {
                $join->on('links.curriculum_course_id', '=', 'curriculum_courses.id')
                    ->where('links.offering_id', $offering->id);
            })
            ->orderBy('track.name')
            ->orderBy('programme.name')
            ->orderBy('versions.version')
            ->orderBy('curriculum_courses.id')
            ->toBase()
            ->get([
                'curriculum_courses.id', 'track.name as track', 'programme.name as programme',
                'versions.version as curriculum_version', 'revisions.title as revision_title',
                'revisions.revision_number', 'links.linked_by', 'links.confirmed_at', 'links.confirmation_note',
            ]);

        return $rows->map($this->candidate(...));
    }

    /**
     * @param object{
     *     id: string, track: string, programme: string, curriculum_version: int|string,
     *     revision_title: string, revision_number: int|string, linked_by: string|null, confirmed_at: string|null,
     *     confirmation_note: string|null
     * } $row
     */
    private function candidate(object $row): DeliveryLinkCandidate
    {
        $evidence = DeliveryLinkAttestation::status($row->linked_by, $row->confirmation_note, $row->confirmed_at);

        return new DeliveryLinkCandidate(
            $row->id,
            $row->track,
            $row->programme,
            (int) $row->curriculum_version,
            $row->revision_title,
            (int) $row->revision_number,
            $evidence,
            $evidence === DeliveryLinkEvidenceStatus::Confirmed ? $row->confirmation_note : null,
        );
    }

    /** @return Builder<CurriculumCourse> */
    private function eligible(Offering $offering): Builder
    {
        $query = CurriculumCourse::query()
            ->join('curriculum_courses as catalogue_entry', 'catalogue_entry.course_id', '=', 'curriculum_courses.course_id')
            ->join('course_revisions as revisions', 'revisions.id', '=', 'curriculum_courses.course_revision_id')
            ->join('curricula as versions', 'versions.id', '=', 'curriculum_courses.curriculum_id')
            ->where('catalogue_entry.id', $offering->curriculum_course_id)
            ->where('revisions.status', CurriculumStatus::Approved)
            ->where('versions.status', CurriculumStatus::Approved)
            ->whereNotNull('versions.academic_pathway_id')
            ->whereNotNull('versions.approved_at')
            ->whereNotNull('versions.approved_by')
            ->whereNotNull('revisions.approved_at')
            ->whereNotNull('revisions.approved_by');

        if ($offering->taught_course_revision_id !== null) {
            $query->where('revisions.id', $offering->taught_course_revision_id);
        }

        return $query;
    }
}
