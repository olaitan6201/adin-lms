<?php

namespace App\Enums;

enum OrganisationAuditAction: string
{
    case Created = 'organisation.created';
    case Corrected = 'organisation.corrected';
    case Imported = 'organisation.imported';
}
