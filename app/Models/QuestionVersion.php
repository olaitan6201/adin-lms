<?php

namespace App\Models;

use App\Enums\Assessment\QuestionKind;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuestionVersion extends DomainModel
{
    protected $table = 'question_versions';

    public $timestamps = false;

    protected $hidden = ['marking_key'];

    protected function casts(): array
    {
        return [
            'kind' => QuestionKind::class,
            'options' => 'array',
            'marking_key' => 'array',
        ];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
