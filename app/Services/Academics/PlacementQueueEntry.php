<?php

namespace App\Services\Academics;

final readonly class PlacementQueueEntry
{
    public function __construct(
        public string $id,
        public string $registration,
        public int $number,
        public bool $accepted,
        public int $nextNumber,
    ) {}
}
