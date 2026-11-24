<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class AcademicSession extends DomainModel
{
    use HasFactory;

    protected $table = 'academic_sessions';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'starts_on' => 'immutable_date',
            'ends_on' => 'immutable_date',
        ];
    }
}
