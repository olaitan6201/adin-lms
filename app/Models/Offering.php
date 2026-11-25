<?php

namespace App\Models;

use App\Enums\OfferingStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Offering extends DomainModel
{
    use HasFactory;

    protected $table = 'offerings';

    public function enrolments(): HasMany
    {
        return $this->hasMany(Enrolment::class);
    }

    protected function casts(): array
    {
        return [
            'activity_order' => 'array',
            'status' => OfferingStatus::class,
            'approved_at' => 'immutable_datetime',
        ];
    }

    public function curriculumCourse(): BelongsTo
    {
        return $this->belongsTo(CurriculumCourse::class, 'curriculum_course_id');
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function copiedFrom(): BelongsTo
    {
        return $this->belongsTo(Offering::class, 'copied_from');
    }
}
