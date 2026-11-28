<?php

namespace App\Models;

use Database\Factories\EntryCohortFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EntryCohort extends DomainModel
{
    /** @use HasFactory<EntryCohortFactory> */
    use HasFactory;

    public $timestamps = false;

    protected $fillable = ['code', 'label'];
}
