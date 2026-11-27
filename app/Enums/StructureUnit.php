<?php

namespace App\Enums;

use App\Models\Department;
use App\Models\DomainModel;
use App\Models\Faculty;
use App\Models\Programme;

enum StructureUnit: string
{
    case Faculty = 'faculty';
    case Department = 'department';
    case Programme = 'programme';

    public function table(): string
    {
        $model = $this->model();

        return (new $model)->getTable();
    }

    /** @return class-string<DomainModel> */
    public function model(): string
    {
        return match ($this) {
            self::Faculty => Faculty::class,
            self::Department => Department::class,
            self::Programme => Programme::class,
        };
    }

    public function parent(): ?self
    {
        return match ($this) {
            self::Faculty => null,
            self::Department => self::Faculty,
            self::Programme => self::Department,
        };
    }
}
