<?php

namespace App\Enums;

enum BackupOutcome: string
{
    case Snapshot = 'snapshot';
    case Restored = 'restored';
    case Failed = 'failed';
}
