<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AttemptQuestion extends DomainModel
{
    protected $table = 'attempt_questions';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'option_order' => 'array',
        ];
    }

    public function latestResponse(): HasOne
    {
        return $this->hasOne(ExaminationResponse::class, 'attempt_question_id')->orderByDesc('revision');
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExaminationAttempt::class, 'attempt_id');
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(QuestionVersion::class, 'version_id');
    }
}
