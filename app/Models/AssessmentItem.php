<?php

namespace App\Models;

use App\Enums\Assessment\ItemKind;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentItem extends DomainModel
{
    protected $table = 'assessment_items';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'kind' => ItemKind::class,
            'rubric' => 'array',
        ];
    }

    public function courseId(): string
    {
        return $this->gradebook->offering->curriculumCourse?->course_id
            ?? abort(422, 'Offering needs a curriculum course.');
    }

    public function gradebook(): BelongsTo
    {
        return $this->belongsTo(Gradebook::class, 'gradebook_id');
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_id');
    }
}
