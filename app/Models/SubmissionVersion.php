<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionVersion extends DomainModel
{
    protected $table = 'submission_versions';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'submitted_at' => 'immutable_datetime',
        ];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class, 'submission_id');
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
