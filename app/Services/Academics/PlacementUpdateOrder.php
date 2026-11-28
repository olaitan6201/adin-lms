<?php

namespace App\Services\Academics;

use App\Enums\PlacementUpdateDisposition;
use App\Models\PlacementAcceptance;
use App\Models\PlacementUpdate;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use LogicException;

final class PlacementUpdateOrder
{
    /**
     * The caller must supply accepted records from the same registration, while holding its write lock.
     * A row ready for review is not permission to apply it.
     */
    public function assess(
        PlacementCsvRow $incoming,
        int $lastAccepted,
        ?PlacementCsvRow $acceptedAtNumber = null,
    ): PlacementUpdateDisposition {
        if (! PlacementCsvRow::validUpdateNumber($incoming->updateNumber)
            || ($lastAccepted !== 0 && ! PlacementCsvRow::validUpdateNumber($lastAccepted))) {
            throw new LogicException('Placement update numbers must be between 1 and 999999999.');
        }

        if ($acceptedAtNumber !== null) {
            if ($acceptedAtNumber->registrationId !== $incoming->registrationId
                || $acceptedAtNumber->updateNumber !== $incoming->updateNumber
                || $incoming->updateNumber > $lastAccepted) {
                throw new LogicException('The accepted comparison row must match the incoming registration and update number.');
            }

            return (array) $acceptedAtNumber === (array) $incoming
                ? PlacementUpdateDisposition::ExactReplay
                : PlacementUpdateDisposition::Conflict;
        }

        return $this->next($incoming->updateNumber, $lastAccepted);
    }

    public function next(int $incoming, int $lastAccepted): PlacementUpdateDisposition
    {
        return match (true) {
            ! PlacementCsvRow::validUpdateNumber($incoming) => PlacementUpdateDisposition::Conflict,
            $lastAccepted < 0 => PlacementUpdateDisposition::Conflict,
            $incoming <= $lastAccepted => PlacementUpdateDisposition::Conflict,
            $incoming === $lastAccepted + 1 => PlacementUpdateDisposition::ReadyForReview,
            default => PlacementUpdateDisposition::HeldForEarlierUpdate,
        };
    }

    /**
     * Check the selected placement against the locked history ordered by increasing update number.
     *
     * @param  iterable<PlacementUpdate>  $history
     * @param  Collection<string, PlacementAcceptance>  $receipts  Keyed by placement update ID.
     */
    public function linkHold(
        PlacementUpdate $placement,
        iterable $history,
        Collection $receipts,
        CarbonImmutable $start,
        CarbonImmutable $checkedAt,
    ): ?string {
        $latest = [];
        $predecessors = [];
        $canStillTie = $checkedAt->startOfSecond()->equalTo($start);
        foreach ($history as $candidate) {
            $receipt = $receipts->get($candidate->id);
            $registrationId = $candidate->official_registration_id;
            $relevant = $registrationId === $placement->official_registration_id
                || $candidate->academic_session_id === $placement->academic_session_id;

            if ($receipt === null) {
                if ($relevant && $this->couldApply($candidate, $predecessors[$registrationId] ?? null, $canStillTie)) {
                    return 'An unapproved placement update could apply to this roster start. Keep this link on hold.';
                }

                continue;
            }

            if ($relevant && $candidate->effective_on->isSameDay($start) && $receipt->approved_at->equalTo($start)
                && $receipt->effective_at->equalTo($start->addSecond())) {
                return 'The roster start and transfer approval were recorded in the same second. Keep this link on hold.';
            }

            $predecessors[$registrationId] = $candidate;
            if ($receipt->effective_at <= $start) {
                $latest[$registrationId] = $candidate;
            }
        }

        $matches = array_filter($latest, fn (PlacementUpdate $row): bool => $row->academic_session_id === $placement->academic_session_id);

        return count($matches) === 1 && reset($matches)->id === $placement->id
            ? null
            : 'The selected placement is not the only one that applied when this enrolment started.';
    }

    private function couldApply(PlacementUpdate $candidate, ?PlacementUpdate $predecessor, bool $canStillTie): bool
    {
        if ($predecessor === null) {
            return true;
        }

        if ($candidate->effective_on <= $predecessor->effective_on) {
            return false;
        }

        // Only a known next transfer can be ruled out by its prospective approval time.
        return $canStillTie
            || $candidate->update_number !== $predecessor->update_number + 1
            || ! PlacementPin::requiresReason($candidate, $predecessor);
    }
}
