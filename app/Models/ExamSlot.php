<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamSlot extends Model
{
    protected $table = 'exam_slots';

    public $timestamps = false;

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Examination::class, 'exam_id');
    }

    public function fixedVersion(): BelongsTo
    {
        return $this->belongsTo(QuestionVersion::class, 'fixed_version_id');
    }

    public function drawFromBank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class, 'draw_from_bank_id');
    }
}
