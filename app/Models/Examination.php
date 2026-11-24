<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Examination extends Model
{
    protected $table = 'examinations';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'opens_at' => 'immutable_datetime',
            'closes_at' => 'immutable_datetime',
            'shuffle_options' => 'boolean',
            'security_policy' => 'array',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(AssessmentItem::class, 'item_id');
    }
}
