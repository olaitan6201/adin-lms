<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonProgress extends DomainModel
{
    protected $table = 'lesson_progress';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'last_seen' => 'immutable_datetime',
            'completed_at' => 'immutable_datetime',
        ];
    }

    public function enrolment(): BelongsTo
    {
        return $this->belongsTo(Enrolment::class, 'enrolment_id');
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }
}
