<?php

namespace App\Enums;

enum PrivacyOperation: string
{
    case Export = 'export';
    case Purge = 'purge';
}
