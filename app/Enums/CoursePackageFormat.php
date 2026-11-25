<?php

namespace App\Enums;

enum CoursePackageFormat: string
{
    case Scorm = 'scorm';
    case Native = 'native';

    public function manifestName(): string
    {
        return match ($this) {
            self::Scorm => 'imsmanifest.xml',
            self::Native => 'course.json',
        };
    }
}
