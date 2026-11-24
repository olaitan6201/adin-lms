<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssessmentItem extends Model
{
    protected $table = 'assessment_items';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'rubric' => 'array',
        ];
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
