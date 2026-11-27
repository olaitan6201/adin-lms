<?php

namespace App\Models;

use Database\Factories\ProgrammeLevelFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgrammeLevel extends DomainModel
{
    /** @use HasFactory<ProgrammeLevelFactory> */
    use HasFactory;

    protected $fillable = ['academic_programme_id', 'code', 'label', 'position'];

    public function programme(): BelongsTo
    {
        return $this->belongsTo(AcademicProgramme::class, 'academic_programme_id');
    }

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'revision_number' => 'integer',
        ];
    }
}
