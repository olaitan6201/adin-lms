<?php

namespace App\Models;

use App\Enums\TeachingPlanStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeachingPlan extends DomainModel
{
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'status' => TeachingPlanStatus::class,
            'snapshot' => 'array',
            'revision' => 'integer',
            'submitted_at' => 'immutable_datetime',
            'reviewed_at' => 'immutable_datetime',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
