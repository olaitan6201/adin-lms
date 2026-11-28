<?php

namespace App\Enums;

enum OfferingLifecycleAction: string
{
    case Prepare = 'prepare';
    case Copy = 'copy';
    case Publish = 'publish';
    case Unpublish = 'unpublish';
    case Archive = 'archive';

    public function allows(OfferingStatus $status): bool
    {
        return match ($this) {
            self::Prepare, self::Copy, self::Publish => in_array($status, [OfferingStatus::Draft, OfferingStatus::Unpublished], true),
            self::Unpublish => $status === OfferingStatus::Published,
            self::Archive => in_array($status, [OfferingStatus::Published, OfferingStatus::Unpublished, OfferingStatus::Draft], true),
        };
    }
}
