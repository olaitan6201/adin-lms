<?php

namespace App\Models;

use App\Enums\CurriculumCourseCategory;
use App\Enums\CurriculumRequirementMode;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurriculumCourse extends DomainModel
{
    use HasFactory;

    protected $table = 'curriculum_courses';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'compulsory' => 'boolean',
        ];
    }

    protected function category(): Attribute
    {
        return Attribute::set(fn (CurriculumCourseCategory|string|null $value): ?string => $value instanceof CurriculumCourseCategory ? $value->value : $value);
    }

    protected function requirementMode(): Attribute
    {
        return Attribute::set(fn (CurriculumRequirementMode|string|null $value): ?string => $value instanceof CurriculumRequirementMode ? $value->value : $value);
    }

    protected function pathwayCategory(): Attribute
    {
        return Attribute::get(fn (): ?CurriculumCourseCategory => CurriculumCourseCategory::tryFrom($this->category ?? ''));
    }

    protected function pathwayRequirementMode(): Attribute
    {
        return Attribute::get(fn (): ?CurriculumRequirementMode => CurriculumRequirementMode::tryFrom($this->requirement_mode ?? ''));
    }

    public function curriculum(): BelongsTo
    {
        return $this->belongsTo(Curriculum::class, 'curriculum_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(AcademicLevel::class, 'level_id');
    }
}
