<?php

namespace App\Services\ScormRuntime;

final class ReadingState
{
    public const INITIAL = ['cmi.core.lesson_status' => 'not attempted', 'cmi.core.score.raw' => '',
        'cmi.core.exit' => '', 'cmi.suspend_data' => ''];

    public static function validate(mixed $state): array
    {
        abort_unless(is_array($state) && count($state) === 4 && ! array_diff_key(self::INITIAL, $state)
            && in_array($state['cmi.core.lesson_status'], ['incomplete', 'completed'], true)
            && is_string($state['cmi.suspend_data']) && strlen($state['cmi.suspend_data']) <= 4096
            && ! preg_match('/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/', $state['cmi.suspend_data']), 422);
        $complete = $state['cmi.core.lesson_status'] === 'completed';
        abort_unless($state['cmi.core.score.raw'] === ($complete ? '100' : '0')
            && $state['cmi.core.exit'] === ($complete ? '' : 'suspend'), 422);

        return $state;
    }
}
