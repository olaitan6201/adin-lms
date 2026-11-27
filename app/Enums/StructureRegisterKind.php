<?php

namespace App\Enums;

enum StructureRegisterKind: string
{
    case Programme = 'shared-programmes';
    case Level = 'programme-levels';
    case Specialization = 'specializations';
    case Pathway = 'pathways';

}
