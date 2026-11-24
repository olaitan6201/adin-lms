<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseOutcome extends Model
{
    protected $table = 'course_outcomes';

    public $timestamps = false;

    public function curriculumCourse(): BelongsTo
    {
        return $this->belongsTo(CurriculumCourse::class, 'curriculum_course_id');
    }
}
