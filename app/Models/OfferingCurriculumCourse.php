<?php

namespace App\Models;

use App\Enums\DeliveryLinkEvidenceStatus;
use App\Services\Academics\DeliveryLinkAttestation;
use Carbon\CarbonImmutable;
use LogicException;

/**
 * @property string $id
 * @property string $offering_id
 * @property string $curriculum_course_id
 * @property string|null $linked_by
 * @property string|null $confirmation_note
 * @property CarbonImmutable|null $confirmed_at
 */
final class OfferingCurriculumCourse extends DomainModel
{
    public const UPDATED_AT = null;

    private const EVIDENCE_FIELDS = ['linked_by', 'confirmation_note', 'confirmed_at'];

    protected $fillable = ['offering_id', 'curriculum_course_id', 'linked_by', 'confirmation_note', 'confirmed_at'];

    protected static function booted(): void
    {
        self::creating(function (self $link): void {
            $link->requireEvidence();
        });

        self::updating(function (self $link): void {
            $original = DeliveryLinkAttestation::status(
                $link->getRawOriginal('linked_by'),
                $link->getRawOriginal('confirmation_note'),
                $link->getRawOriginal('confirmed_at'),
            );

            if ($original !== DeliveryLinkEvidenceStatus::Unconfirmed
                || array_diff(array_keys($link->getDirty()), self::EVIDENCE_FIELDS) !== []) {
                throw new LogicException('Only an unconfirmed delivery link can receive evidence.');
            }

            $link->requireEvidence();
        });

        self::deleting(function (): never {
            throw new LogicException('Delivery links are retained.');
        });
    }

    private function requireEvidence(): void
    {
        if ($this->evidenceStatus() !== DeliveryLinkEvidenceStatus::Confirmed) {
            throw new LogicException('A delivery link requires complete confirmation evidence.');
        }
    }

    public function evidenceStatus(): DeliveryLinkEvidenceStatus
    {
        return DeliveryLinkAttestation::status(
            $this->linked_by,
            $this->confirmation_note,
            $this->getAttributes()['confirmed_at'] ?? null,
        );
    }

    /** @return array{confirmed_at: 'immutable_datetime'} */
    protected function casts(): array
    {
        return ['confirmed_at' => 'immutable_datetime'];
    }
}
