<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Assignment extends Model
{
    protected $table = 'assignments';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'opens_at' => 'immutable_datetime',
            'due_at' => 'immutable_datetime',
            'closes_at' => 'immutable_datetime',
            'accepted_formats' => 'array',
            'late_policy' => 'array',
            'editable' => 'boolean',
            'group_work' => 'boolean',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(AssessmentItem::class, 'item_id');
    }
}
