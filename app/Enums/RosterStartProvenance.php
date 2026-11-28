<?php

namespace App\Enums;

enum RosterStartProvenance: string
{
    case InitialImport = 'initial_import';
    case LegacyReaffirmation = 'legacy_reaffirmation';
    case Reactivation = 'reactivation';
}
