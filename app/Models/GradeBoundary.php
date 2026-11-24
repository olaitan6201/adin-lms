<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeBoundary extends DomainModel
{
    protected $table = 'grade_boundaries';

    public $timestamps = false;

    public function policy(): BelongsTo
    {
        return $this->belongsTo(GradingPolicy::class, 'policy_id');
    }
}
