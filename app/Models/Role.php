<?php

namespace App\Models;

use App\Enums\RoleCode;

class Role extends DomainModel
{
    protected $table = 'roles';

    public $timestamps = false;

    protected function casts(): array
    {
        return ['code' => RoleCode::class];
    }
}
