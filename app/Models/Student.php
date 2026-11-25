<?php

namespace App\Models;

use App\Enums\StudentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends DomainModel
{
    use HasFactory;

    protected $table = 'students';

    protected function casts(): array
    {
        return ['status' => StudentStatus::class];
    }

    public function enrolments(): HasMany
    {
        return $this->hasMany(Enrolment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
