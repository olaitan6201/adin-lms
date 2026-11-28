<?php

namespace App\Models;

use App\Models\Concerns\AppendOnly;
use Database\Factories\CurriculumAdoptionDecisionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurriculumAdoptionDecision extends DomainModel
{
    use AppendOnly;

    /** @use HasFactory<CurriculumAdoptionDecisionFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'academic_pathway_id', 'academic_session_id', 'entry_cohort_id', 'curriculum_id',
        'decision_reference', 'approved_by', 'reason', 'recorded_at',
    ];

    protected function casts(): array
    {
        return ['recorded_at' => 'immutable_datetime'];
    }

    public function curriculum(): BelongsTo
    {
        return $this->belongsTo(Curriculum::class);
    }

    public function academicPathway(): BelongsTo
    {
        return $this->belongsTo(AcademicPathway::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function entryCohort(): BelongsTo
    {
        return $this->belongsTo(EntryCohort::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
