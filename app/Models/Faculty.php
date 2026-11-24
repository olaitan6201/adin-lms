<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Faculty extends DomainModel
{
    use HasFactory;

    protected $table = 'faculties';

    public $timestamps = false;
}
