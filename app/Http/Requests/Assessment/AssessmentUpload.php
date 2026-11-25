<?php

namespace App\Http\Requests\Assessment;

final class AssessmentUpload
{
    public const RULE = 'nullable|file|max:20480|mimes:pdf,txt';

    public const FORMATS = ['txt', 'pdf', 'csv', 'json', 'py', 'c', 'cpp', 'java', 'js', 'ts', 'sql', 'zip', 'docx', 'xlsx'];
}
