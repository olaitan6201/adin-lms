<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prerequisite extends Model
{
    protected $table = 'prerequisites';

    public $timestamps = false;

    public function curriculumCourse(): BelongsTo
    {
        return $this->belongsTo(CurriculumCourse::class, 'curriculum_course_id');
    }

    public function requiredCourse(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'required_course_id');
    }
}
