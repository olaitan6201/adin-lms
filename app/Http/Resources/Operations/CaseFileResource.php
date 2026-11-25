<?php

namespace App\Http\Resources\Operations;

use App\Models\AuditLog;
use App\Models\PrivacyCaseFile;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin PrivacyCaseFile */
final class CaseFileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 'reference' => $this->reference, 'kind' => $this->kind->value,
            'stage' => $this->stage->value, 'next' => $this->kind->next($this->stage)?->value,
            'evidence' => $this->evidence, 'owner' => $this->owner_id,
            'receipts' => $this->receipts->map(fn (AuditLog $row): array => [
                'id' => $row->id, 'time' => $row->occurred_at->toIso8601String(), 'actor' => $row->actor_id,
                'stage' => $row->details['stage'], 'reference' => $row->details['reference'],
            ]),
        ];
    }
}
