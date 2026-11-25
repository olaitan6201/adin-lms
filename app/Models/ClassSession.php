<?php

namespace App\Models;

use App\Enums\Learning\ClassStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassSession extends DomainModel
{
    protected $table = 'classes';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'status' => ClassStatus::class,

            'starts_at' => 'immutable_datetime',
            'ends_at' => 'immutable_datetime',
        ];
    }

    public function offering(): BelongsTo
    {
        return $this->belongsTo(Offering::class, 'offering_id');
    }

    public function recordingMaterial(): BelongsTo
    {
        return $this->belongsTo(LearningMaterial::class, 'recording_material_id');
    }
}
