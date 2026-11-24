<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Gradebook extends DomainModel
{
    protected $table = 'gradebooks';

    public $timestamps = false;

    public function offering(): BelongsTo
    {
        return $this->belongsTo(Offering::class, 'offering_id');
    }

    public function policy(): BelongsTo
    {
        return $this->belongsTo(GradingPolicy::class, 'policy_id');
    }
}
