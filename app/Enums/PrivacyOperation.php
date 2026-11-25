<?php

namespace App\Enums;

enum PrivacyOperation: string
{
    case Export = 'export';
    case RegistrationExtract = 'registration_extract';
    case Purge = 'purge';
}
