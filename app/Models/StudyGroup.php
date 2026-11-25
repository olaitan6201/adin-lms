<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudyGroup extends DomainModel
{
    protected $table = 'study_groups';

    public $timestamps = false;

    public function offering(): BelongsTo
    {
        return $this->belongsTo(Offering::class, 'offering_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(GroupMember::class, 'group_id');
    }
}
