<?php

namespace App\Services\Academics;

final readonly class PlacementEnrolmentOption
{
    public function __construct(
        public string $id,
        public ?string $offering,
        public ?string $section,
        public bool $linked,
        public bool $linkedHere,
    ) {}
}
