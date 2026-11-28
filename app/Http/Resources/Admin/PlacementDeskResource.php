<?php

namespace App\Http\Resources\Admin;

use App\Services\Academics\PlacementDeskSelection;
use App\Services\Academics\PlacementEnrolmentOption;
use App\Services\Academics\PlacementQueueEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/**
 * @phpstan-type PlacementDeskData array{
 *     updates: list<PlacementQueueEntry>, hasMorePages: bool, selected: PlacementDeskSelection|null,
 *     enrolments: Collection<int, PlacementEnrolmentOption>
 * }
 * @phpstan-type QueueRow array{id: string, registration: string, number: int, accepted: bool, nextNumber: int, url: string}
 * @phpstan-type DetailRow array{
 *     id: string, registration: string, student: string, number: int, effectiveOn: string,
 *     pathway: string, session: string, cohort: string, level: string, accepted: bool,
 *     nextNumber: int, curriculumVersion: int|null, approvalNote: string|null, url: string, requiresReason: bool
 * }
 */
final class PlacementDeskResource extends JsonResource
{
    /** @param PlacementDeskData $data */
    public function __construct(array $data, private readonly PlacementDeskLocation $location)
    {
        parent::__construct($data);
    }

    /**
     * @return array{
     *     updates: list<QueueRow>, previous: string|null, next: string|null, listUrl: string, selected: DetailRow|null,
     *     enrolments: list<array{id: string, offering: string|null, section: string|null, linked: bool, linkedHere: bool}>,
     *     actions: array{template: string, references: string, upload: string, approve: string|null, link: string|null}
     * }
     */
    public function toArray(Request $request): array
    {
        /** @var PlacementDeskData $data */
        $data = $this->resource;
        $selected = $data['selected'];
        $selectedId = $selected?->entry->id;

        return [
            'updates' => array_map($this->entry(...), $data['updates']),
            'previous' => $this->location->previousUrl($selectedId),
            'next' => $this->location->nextUrl($data['hasMorePages'], $selectedId),
            'listUrl' => $this->location->urlFor(),
            'selected' => $selected === null ? null : $this->selection($selected),
            'enrolments' => $data['enrolments']->map(static fn (PlacementEnrolmentOption $row): array => [
                'id' => $row->id,
                'offering' => $row->offering,
                'section' => $row->section,
                'linked' => $row->linked,
                'linkedHere' => $row->linkedHere,
            ])->values()->all(),
            'actions' => [
                'template' => route('admin.placements.template', absolute: false),
                'references' => route('admin.placements.references', absolute: false),
                'upload' => $this->location->urlFor('upload'),
                'approve' => $selectedId === null ? null : $this->location->urlFor('approve', $selectedId),
                'link' => $selectedId === null ? null : $this->location->urlFor('link', $selectedId),
            ],
        ];
    }

    /** @return QueueRow */
    private function entry(PlacementQueueEntry $row): array
    {
        return [
            'id' => $row->id,
            'registration' => $row->registration,
            'number' => $row->number,
            'accepted' => $row->accepted,
            'nextNumber' => $row->nextNumber,
            'url' => $this->location->urlFor(update: $row->id),
        ];
    }

    /** @return DetailRow */
    private function selection(PlacementDeskSelection $row): array
    {
        return $this->entry($row->entry) + [
            'student' => $row->student,
            'effectiveOn' => $row->effectiveOn,
            'pathway' => $row->pathway,
            'session' => $row->session,
            'cohort' => $row->cohort,
            'level' => $row->level,
            'curriculumVersion' => $row->curriculumVersion,
            'approvalNote' => $row->approvalNote,
            'requiresReason' => $row->requiresReason,
        ];
    }
}
