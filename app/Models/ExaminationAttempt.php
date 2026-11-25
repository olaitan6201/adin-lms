<?php

namespace App\Models;

use App\Enums\Assessment\AttemptState;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExaminationAttempt extends DomainModel
{
    protected $table = 'examination_attempts';

    protected $hidden = ['visibility_receipts'];

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'visibility_receipts' => 'array',
            'state' => AttemptState::class,
            'started_at' => 'immutable_datetime',
            'expires_at' => 'immutable_datetime',
            'submitted_at' => 'immutable_datetime',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Examination::class, 'exam_id');
    }

    public function enrolment(): BelongsTo
    {
        return $this->belongsTo(Enrolment::class, 'enrolment_id');
    }
}
