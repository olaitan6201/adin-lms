<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends DomainModel
{
    use HasFactory;

    protected $table = 'departments';

    public $timestamps = false;

    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class, 'faculty_id');
    }

    public function specializations(): HasMany
    {
        return $this->hasMany(Specialization::class);
    }
}
