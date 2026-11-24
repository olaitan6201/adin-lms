<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionRecipient extends Model
{
    protected $table = 'submission_recipients';

    public $timestamps = false;

    public function version(): BelongsTo
    {
        return $this->belongsTo(SubmissionVersion::class, 'version_id');
    }

    public function enrolment(): BelongsTo
    {
        return $this->belongsTo(Enrolment::class, 'enrolment_id');
    }
}
