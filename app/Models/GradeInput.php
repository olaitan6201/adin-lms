<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeInput extends Model
{
    protected $table = 'grade_inputs';

    public $timestamps = false;

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class, 'grade_id');
    }

    public function score(): BelongsTo
    {
        return $this->belongsTo(AssessmentScore::class, 'score_id');
    }
}
