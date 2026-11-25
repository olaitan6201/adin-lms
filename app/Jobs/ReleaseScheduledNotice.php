<?php

namespace App\Jobs;

use App\Enums\TimedNotice;
use App\Services\Community\TimedReleaseCapture;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

final class ReleaseScheduledNotice implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $course,
        public readonly TimedNotice $kind,
        public readonly string $source,
        public readonly int $at,
        public readonly ?int $prerequisiteRevision = null,
    ) {}

    public function handle(TimedReleaseCapture $capture): void
    {
        $capture->release($this);
    }
}
