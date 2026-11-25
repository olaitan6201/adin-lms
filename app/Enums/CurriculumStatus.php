<?php

namespace App\Enums;

enum CurriculumStatus: string
{
    case Draft = 'draft';
    case Reviewed = 'reviewed';
    case Approved = 'approved';
}
