<?php

namespace App\Models;

use App\Enums\StructureRegisterStatus;
use Database\Factories\AcademicPathwayFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicPathway extends DomainModel
{
    /** @use HasFactory<AcademicPathwayFactory> */
    use HasFactory;

    protected $fillable = ['specialization_id', 'academic_programme_id'];

    public function programme(): BelongsTo
    {
        return $this->belongsTo(AcademicProgramme::class, 'academic_programme_id');
    }

    public function specialization(): BelongsTo
    {
        return $this->belongsTo(Specialization::class);
    }

    protected function casts(): array
    {
        return ['status' => StructureRegisterStatus::class];
    }
}
