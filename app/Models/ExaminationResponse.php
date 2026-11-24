<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExaminationResponse extends Model
{
    protected $table = 'examination_responses';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'answer' => 'array',
            'saved_at' => 'immutable_datetime',
        ];
    }

    public function attemptQuestion(): BelongsTo
    {
        return $this->belongsTo(AttemptQuestion::class, 'attempt_question_id');
    }
}
