<?php

namespace App\Models;

use App\Models\Concerns\AppendOnly;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentCriterionFeedback extends DomainModel
{
    use AppendOnly;
    use HasFactory;

    protected $table = 'assessment_criterion_feedback';

    public $timestamps = false;

    public function score(): BelongsTo
    {
        return $this->belongsTo(AssessmentScore::class, 'score_id');
    }
}
