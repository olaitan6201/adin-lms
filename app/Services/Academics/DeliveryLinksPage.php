<?php

namespace App\Services\Academics;

use App\Models\Offering;
use App\Models\User;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;

/**
 * @phpstan-type Page array{
 *     offerings: Paginator<int, Offering>, selected: Offering|null, candidates: Collection<int, DeliveryLinkCandidate>
 * }
 */
final class DeliveryLinksPage
{
    private const PER_PAGE = 25;

    public function __construct(private DeliveryLinkCandidates $candidates) {}

    /** @return Page */
    public function read(User $actor, ?Offering $selected, int $page = 1): array
    {
        $gate = Gate::forUser($actor);
        $gate->authorize('manageDeliveryLinks', Offering::class);
        $published = DeliveryLinkOfferings::query();

        if ($selected !== null) {
            $selected = (clone $published)->findOrFail($selected->id);
            $gate->authorize('manageDeliveryLinks', $selected);
        }

        return [
            'offerings' => $published->orderBy('external_offering_id')->orderBy('id')
                ->simplePaginate(self::PER_PAGE, ['id', 'external_offering_id'], 'page', $page),
            'selected' => $selected,
            'candidates' => $selected === null ? collect() : $this->candidates->forOffering($selected),
        ];
    }

    public static function pageNumber(mixed $value): int
    {
        if (! is_string($value) && ! is_int($value)) {
            return 1;
        }

        return filter_var($value, FILTER_VALIDATE_INT, [
            'options' => ['min_range' => 1, 'max_range' => intdiv(PHP_INT_MAX, self::PER_PAGE) - 1],
        ]) ?: 1;
    }

    /** @return array{page?: int} */
    public static function pageQuery(int $page): array
    {
        return $page > 1 ? ['page' => $page] : [];
    }
}
