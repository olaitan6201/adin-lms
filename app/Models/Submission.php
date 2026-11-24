<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends DomainModel
{
    protected $table = 'submissions';

    public $timestamps = false;

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
    }

    public function enrolment(): BelongsTo
    {
        return $this->belongsTo(Enrolment::class, 'enrolment_id');
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(StudyGroup::class, 'group_id');
    }
}
