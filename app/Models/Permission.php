<?php

namespace App\Models;

use App\Enums\PermissionCode;

class Permission extends DomainModel
{
    protected $table = 'permissions';

    public $timestamps = false;

    protected function casts(): array
    {
        return ['code' => PermissionCode::class];
    }
}
