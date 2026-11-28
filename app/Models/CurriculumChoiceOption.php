<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurriculumChoiceOption extends DomainModel
{
    public $timestamps = false;

    protected $fillable = ['curriculum_id', 'group_id', 'curriculum_course_id'];

    public function group(): BelongsTo
    {
        return $this->belongsTo(CurriculumChoiceGroup::class, 'group_id');
    }

    public function curriculumCourse(): BelongsTo
    {
        return $this->belongsTo(CurriculumCourse::class);
    }
}
