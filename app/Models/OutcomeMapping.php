<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutcomeMapping extends Model
{
    protected $table = 'outcome_mappings';

    public $timestamps = false;

    public function courseOutcome(): BelongsTo
    {
        return $this->belongsTo(CourseOutcome::class, 'course_outcome_id');
    }

    public function programmeOutcome(): BelongsTo
    {
        return $this->belongsTo(ProgrammeOutcome::class, 'programme_outcome_id');
    }
}
