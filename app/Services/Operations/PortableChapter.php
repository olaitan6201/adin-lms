<?php

namespace App\Services\Operations;

final readonly class PortableChapter
{
    /** @param list<array{title:string,url:string}> $links */
    public function __construct(
        public string $title,
        public string $body,
        public array $links,
    ) {}
}
