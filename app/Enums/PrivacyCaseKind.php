<?php

namespace App\Enums;

enum PrivacyCaseKind: string
{
    case Access = 'subject_access';
    case Breach = 'breach';
    case Hold = 'retention_hold';

    public function next(PrivacyCaseStage $stage): ?PrivacyCaseStage
    {
        $steps = match ($this) {
            self::Access => [PrivacyCaseStage::Verified, PrivacyCaseStage::Reviewed, PrivacyCaseStage::Delivered],
            self::Breach => [PrivacyCaseStage::Contained, PrivacyCaseStage::Assessed, PrivacyCaseStage::FollowedUp],
            self::Hold => [],
        };
        $path = [PrivacyCaseStage::Open, ...$steps, PrivacyCaseStage::Closed];
        $position = array_search($stage, $path, true);

        return $position === false ? null : ($path[$position + 1] ?? null);
    }
}
