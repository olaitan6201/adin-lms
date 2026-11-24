<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Curriculum extends DomainModel
{
    use HasFactory;

    protected $table = 'curricula';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'approved_at' => 'immutable_datetime',
        ];
    }

    public function programme(): BelongsTo
    {
        return $this->belongsTo(Programme::class, 'programme_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
