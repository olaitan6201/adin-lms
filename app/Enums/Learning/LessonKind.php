<?php

namespace App\Enums\Learning;

enum LessonKind: string
{
    public const DRAFT_PREFIX = 'draft:';

    case Chapter = 'chapter';
    case Overview = 'overview';
    case Topic = 'topic';
    case Weekly = 'weekly';

    public function stored(bool $published): string
    {
        return $published ? $this->value : self::DRAFT_PREFIX.$this->value;
    }
}
