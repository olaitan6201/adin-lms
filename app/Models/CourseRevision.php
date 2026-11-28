<?php

namespace App\Models;

use App\Enums\CurriculumStatus;
use Database\Factories\CourseRevisionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseRevision extends DomainModel
{
    /** @use HasFactory<CourseRevisionFactory> */
    use HasFactory;

    protected $fillable = ['title', 'description', 'syllabus', 'learning_outcomes', 'standard_units'];

    protected function casts(): array
    {
        return [
            'revision_number' => 'integer',
            'status' => CurriculumStatus::class,
            'standard_units' => 'decimal:8',
            'approved_at' => 'immutable_datetime',
        ];
    }

    /** @param Builder<CourseRevision> $query */
    public function scopeEligibleForDepartment(Builder $query, string $department): void
    {
        $query->where('course_revisions.status', CurriculumStatus::Approved)
            ->whereNotNull('course_revisions.approved_by')
            ->whereNotNull('course_revisions.approved_at')
            ->whereHas('course', fn (Builder $courses) => $courses->where('courses.department_id', $department));
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
