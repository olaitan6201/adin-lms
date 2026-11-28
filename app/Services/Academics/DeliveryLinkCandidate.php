<?php

namespace App\Services\Academics;

use App\Enums\DeliveryLinkEvidenceStatus;

final readonly class DeliveryLinkCandidate
{
    public function __construct(
        public string $id,
        public string $track,
        public string $programme,
        public int $curriculumVersion,
        public string $revisionTitle,
        public int $revisionNumber,
        public DeliveryLinkEvidenceStatus $evidence,
        public ?string $note,
    ) {}
}
