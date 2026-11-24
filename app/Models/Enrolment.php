<?php

namespace App\Models;

use App\Enums\EnrolmentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrolment extends Model
{
    protected $table = 'enrolments';

    protected function casts(): array
    {
        return [
            'status' => EnrolmentStatus::class,
            'enrolled_at' => 'immutable_datetime',
            'completed_at' => 'immutable_datetime',
        ];
    }

    public function offering(): BelongsTo
    {
        return $this->belongsTo(Offering::class, 'offering_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
