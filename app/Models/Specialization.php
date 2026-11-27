<?php

namespace App\Models;

use App\Enums\StructureRegisterStatus;
use Database\Factories\SpecializationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Specialization extends DomainModel
{
    /** @use HasFactory<SpecializationFactory> */
    use HasFactory;

    protected $fillable = ['department_id', 'code', 'name'];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
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
