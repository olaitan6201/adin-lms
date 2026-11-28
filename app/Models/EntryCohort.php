<?php

namespace App\Models;

use Database\Factories\EntryCohortFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EntryCohort extends DomainModel
{
    /** @use HasFactory<EntryCohortFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = ['code', 'label'];
}
