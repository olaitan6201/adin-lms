<?php

namespace App\Services\Operations;

use Illuminate\Support\Str;

final class NativeMaterialReferences
{
    public const FORMAT = 'adin-course-4';

    private const MARKER = '/\{\{resource:([a-f0-9-]{36})\}\}/';

    /** @param array<string,string> $ids Keys and replacements belong to this lesson only. */
    public static function remap(?string $body, array $ids): ?string
    {
        if ($body === null) {
            return null;
        }

        return preg_replace_callback(self::MARKER, static function (array $match) use ($ids): string {
            NativeRules::check(isset($ids[$match[1]]), 'The lesson contains an unmapped resource marker.');

            return '{{resource:'.$ids[$match[1]].'}}';
        }, $body);
    }

    public static function validate(array $lesson, bool $portable): void
    {
        if (! $portable) {
            NativeRules::check(! preg_match(self::MARKER, $lesson['body'] ?? ''),
                'This older backup has inline resource markers without a mapping. Export the source course again.');

            return;
        }

        $ids = [];
        foreach ($lesson['materials'] as $material) {
            $key = $material['ref'];
            NativeRules::check(Str::isUuid($key) && Str::isUuid($key, 4) && strtolower($key) === $key && ! isset($ids[$key]),
                'Material references must be unique lesson-local UUIDv4 keys.');
            $ids[$key] = $key;
        }

        self::remap($lesson['body'], $ids);
    }
}
