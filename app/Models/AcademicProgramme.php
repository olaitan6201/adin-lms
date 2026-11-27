<?php

namespace App\Models;

use App\Enums\StructureRegisterStatus;
use Database\Factories\AcademicProgrammeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicProgramme extends DomainModel
{
    /** @use HasFactory<AcademicProgrammeFactory> */
    use HasFactory;

    protected $fillable = ['code', 'name'];

    public function levels(): HasMany
    {
        return $this->hasMany(ProgrammeLevel::class);
    }

    public function pathways(): HasMany
    {
        return $this->hasMany(AcademicPathway::class);
    }

    protected function casts(): array
    {
        return [
            'revision_number' => 'integer',
            'status' => StructureRegisterStatus::class,
        ];
    }
}
