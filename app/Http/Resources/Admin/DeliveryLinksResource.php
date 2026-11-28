<?php

namespace App\Http\Resources\Admin;

use App\Enums\DeliveryLinkEvidenceStatus;
use App\Models\Offering;
use App\Services\Academics\DeliveryLinkCandidate;
use App\Services\Academics\DeliveryLinksPage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @phpstan-import-type Page from DeliveryLinksPage */
final class DeliveryLinksResource extends JsonResource
{
    /** @param Page $page */
    public function __construct(private readonly array $page)
    {
        parent::__construct($page);
    }

    /**
     * @return array{
     *     offerings: list<array{id: string, name: string, url: string}>, previous: string|null, next: string|null, listUrl: string,
     *     selected: array{id: string, name: string, hasRevision: bool, store: string}|null,
     *     candidates: list<array{id: string, name: string, linked: bool, blocked: bool, note: string|null}>
     * }
     */
    public function toArray(Request $request): array
    {
        $selected = $this->page['selected'];
        $offerings = $this->page['offerings'];
        $pageQuery = DeliveryLinksPage::pageQuery($offerings->currentPage());

        return [
            'offerings' => $offerings->getCollection()
                ->map(fn (Offering $offering): array => $this->offering($offering, $pageQuery))
                ->values()->all(),
            'previous' => $offerings->previousPageUrl(),
            'next' => $offerings->nextPageUrl(),
            'listUrl' => route('admin.delivery-links.index', $pageQuery, false),
            'selected' => $selected === null ? null : $this->selected($selected, $pageQuery),
            'candidates' => $this->page['candidates']->map($this->candidate(...))->values()->all(),
        ];
    }

    /**
     * @param  array{page?: int}  $pageQuery
     * @return array{id: string, name: string, url: string}
     */
    private function offering(Offering $offering, array $pageQuery): array
    {
        return [
            'id' => $offering->id,
            'name' => $offering->external_offering_id,
            'url' => route('admin.delivery-links.index', ['offering' => $offering] + $pageQuery, false),
        ];
    }

    /**
     * @param  array{page?: int}  $pageQuery
     * @return array{id: string, name: string, hasRevision: bool, store: string}
     */
    private function selected(Offering $offering, array $pageQuery): array
    {
        return [
            'id' => $offering->id,
            'name' => $offering->external_offering_id,
            'hasRevision' => $offering->taught_course_revision_id !== null,
            'store' => route('admin.delivery-links.store', ['offering' => $offering] + $pageQuery, false),
        ];
    }

    /** @return array{id: string, name: string, linked: bool, blocked: bool, note: string|null} */
    private function candidate(DeliveryLinkCandidate $candidate): array
    {
        return [
            'id' => $candidate->id,
            'name' => "{$candidate->track} · {$candidate->programme} v{$candidate->curriculumVersion}"
                ." · {$candidate->revisionTitle} (revision {$candidate->revisionNumber})",
            'linked' => $candidate->evidence === DeliveryLinkEvidenceStatus::Confirmed,
            'blocked' => $candidate->evidence === DeliveryLinkEvidenceStatus::Blocked,
            'note' => $candidate->note,
        ];
    }
}
