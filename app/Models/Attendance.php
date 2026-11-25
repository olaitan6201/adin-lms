<?php

namespace App\Models;

use App\Enums\Learning\AttendanceMethod;
use App\Enums\Learning\AttendanceStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends DomainModel
{
    protected $table = 'attendance';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'status' => AttendanceStatus::class,
            'method' => AttendanceMethod::class,

            'recorded_at' => 'immutable_datetime',
        ];
    }

    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class, 'class_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
