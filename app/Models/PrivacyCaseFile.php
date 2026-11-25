<?php

namespace App\Models;

use App\Enums\OperationsEvent;
use App\Enums\PrivacyCaseKind;
use App\Enums\PrivacyCaseStage;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class PrivacyCaseFile extends DomainModel
{
    protected function casts(): array
    {
        return ['kind' => PrivacyCaseKind::class, 'stage' => PrivacyCaseStage::class];
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'subject_key')->where('action', OperationsEvent::CaseAdvanced->value)
            ->orderBy('occurred_at')->orderBy('id');
    }
}
