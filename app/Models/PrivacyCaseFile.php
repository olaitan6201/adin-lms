<?php

namespace App\Models;

use App\Enums\PrivacyCaseKind;
use App\Enums\PrivacyCaseStage;

final class PrivacyCaseFile extends DomainModel
{
    protected function casts(): array
    {
        return ['kind' => PrivacyCaseKind::class, 'stage' => PrivacyCaseStage::class];
    }
}
