<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class AcademicLevel extends DomainModel
{
    use HasFactory;

    protected $table = 'academic_levels';

    public $timestamps = false;
}
