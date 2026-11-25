<?php

namespace App\Enums;

enum ScopeType: string
{
    case Institution = 'institution';
    case Faculty = 'faculty';
    case Department = 'department';
    case Offering = 'offering';

    public function key(?string $id = null): string
    {
        if (($this === self::Institution) !== ($id === null) || $id === '') {
            throw new \InvalidArgumentException('Only a non-institutional scope requires an ID.');
        }

        return $id === null ? $this->value : $this->value.':'.$id;
    }
}
