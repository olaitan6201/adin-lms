<?php

namespace App\Models;

use App\Enums\CurriculumStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Curriculum extends DomainModel
{
    use HasFactory;

    protected $table = 'curricula';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'status' => CurriculumStatus::class,
            'approved_at' => 'immutable_datetime',
        ];
    }

    public function programme(): BelongsTo
    {
        return $this->belongsTo(Programme::class, 'programme_id');
    }

    public function academicPathway(): BelongsTo
    {
        return $this->belongsTo(AcademicPathway::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
