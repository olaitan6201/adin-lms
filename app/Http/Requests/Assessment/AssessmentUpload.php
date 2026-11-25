<?php

namespace App\Http\Requests\Assessment;

final class AssessmentUpload
{
    public const RULE = 'nullable|file|max:20480|mimes:pdf,txt';
}
