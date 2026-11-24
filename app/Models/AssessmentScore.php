<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentScore extends DomainModel
{
    protected $table = 'assessment_scores';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'changed_at' => 'immutable_datetime',
            'released_at' => 'immutable_datetime',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(AssessmentItem::class, 'item_id');
    }

    public function enrolment(): BelongsTo
    {
        return $this->belongsTo(Enrolment::class, 'enrolment_id');
    }

    public function submissionVersion(): BelongsTo
    {
        return $this->belongsTo(SubmissionVersion::class, 'submission_version_id');
    }

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExaminationAttempt::class, 'attempt_id');
    }

    public function markedFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'marked_file_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
