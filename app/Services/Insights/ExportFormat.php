<?php

namespace App\Services\Insights;

enum ExportFormat: string
{
    case Pdf = 'pdf';
    case Workbook = 'xlsx';
}
