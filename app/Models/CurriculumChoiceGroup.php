<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CurriculumChoiceGroup extends DomainModel
{
    public const UPDATED_AT = null;

    protected $fillable = ['curriculum_id', 'code', 'minimum_selections', 'maximum_selections'];

    protected function casts(): array
    {
        return ['minimum_selections' => 'integer', 'maximum_selections' => 'integer'];
    }

    public function curriculum(): BelongsTo
    {
        return $this->belongsTo(Curriculum::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(CurriculumChoiceOption::class, 'group_id');
    }
}
