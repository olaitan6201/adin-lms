<?php

namespace App\Models;

use Database\Factories\CurriculumAdoptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurriculumAdoption extends DomainModel
{
    /** @use HasFactory<CurriculumAdoptionFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['academic_pathway_id', 'academic_session_id', 'entry_cohort_id', 'active_decision_id'];

    public function activeDecision(): BelongsTo
    {
        return $this->belongsTo(CurriculumAdoptionDecision::class);
    }
}
