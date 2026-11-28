<?php

namespace App\Services\Academics;

final readonly class PlacementDeskSelection
{
    public function __construct(
        public PlacementQueueEntry $entry,
        public string $student,
        public string $effectiveOn,
        public string $pathway,
        public string $session,
        public string $cohort,
        public string $level,
        public ?int $curriculumVersion,
        public ?string $approvalNote,
        public bool $requiresReason,
    ) {}
}
