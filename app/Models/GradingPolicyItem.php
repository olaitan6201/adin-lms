<?php

namespace App\Models;

use App\Models\Concerns\AppendOnly;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradingPolicyItem extends DomainModel
{
    use AppendOnly;
    use HasFactory;

    protected $table = 'grading_policy_items';

    public $timestamps = false;

    protected function casts(): array
    {
        return ['rubric' => 'array'];
    }

    public function policy(): BelongsTo
    {
        return $this->belongsTo(GradingPolicy::class, 'policy_id');
    }

    public function assessmentItem(): BelongsTo
    {
        return $this->belongsTo(AssessmentItem::class, 'assessment_item_id');
    }
}
