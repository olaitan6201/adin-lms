<?php

namespace App\Services\Operations;

use App\Enums\Assessment\QuestionKind;

final class NativeQuestionRules
{
    public static function banks(mixed $banks): void
    {
        NativeRules::rows($banks, 20);
        $topics = [];
        $total = 0;
        foreach ($banks as $bank) {
            NativeRules::fields($bank, ['topic', 'questions']);
            NativeRules::string($bank['topic'], 191);
            $topic = mb_strtolower($bank['topic']);
            NativeRules::check(! isset($topics[$topic]), 'Repeated bank topic.');
            $topics[$topic] = true;
            NativeRules::rows($bank['questions'], 100);
            foreach ($bank['questions'] as $versions) {
                NativeRules::rows($versions, 20, 1);
                $previous = 0;
                foreach ($versions as $version) {
                    NativeRules::check(++$total <= 300);
                    NativeRules::fields($version, ['revision', 'kind', 'prompt', 'options', 'key']);
                    NativeRules::check(is_int($version['revision']) && $version['revision'] > $previous && $version['revision'] <= 2147483647);
                    $previous = $version['revision'];
                    NativeRules::string($version['prompt'], 12000);
                    NativeRules::check(is_string($version['kind']) && ($kind = QuestionKind::tryFrom($version['kind'])) !== null);
                    $options = $version['options'] ?? [];
                    NativeRules::rows($options, 100, $kind->hasChoices() ? 2 : 0);
                    foreach ($options as $option) {
                        NativeRules::string($option, 5000);
                    }

                    if ($version['key'] !== null || $kind->isObjective()) {
                        if ($kind === QuestionKind::Matching && isset($version['key']['matching'])) {
                            NativeRules::fields($version['key'], ['accepted', 'matching']);
                            NativeRules::check($version['key']['accepted'] === []);
                            self::matching($version['key']['matching']);

                            continue;
                        }

                        if (isset($version['key']['guide'])) {
                            NativeRules::fields($version['key'], ['accepted', 'guide']);
                            NativeRules::check(is_string($version['key']['guide']) && mb_strlen($version['key']['guide']) <= 5000 && ! str_contains($version['key']['guide'], "\0"));
                        } else {
                            NativeRules::fields($version['key'], ['accepted']);
                        }

                        NativeRules::rows($version['key']['accepted'], 100, $kind->isObjective() ? 1 : 0);
                        foreach ($version['key']['accepted'] as $answer) {
                            if ($answer !== null || $kind->isObjective()) {
                                NativeRules::string($answer, 5000);
                            }

                            NativeRules::check(! $kind->hasChoices() || in_array($answer, $options, true));
                        }
                    }
                }
            }
        }
    }

    private static function matching(mixed $matching): void
    {
        NativeRules::fields($matching, ['left', 'right', 'pairs']);
        $ids = [];
        foreach (['left', 'right'] as $side) {
            NativeRules::rows($matching[$side], 20, 2);
            foreach ($matching[$side] as $row) {
                NativeRules::fields($row, ['id', 'label']);
                NativeRules::string($row['label'], 5000);
                NativeRules::check(is_string($row['id']) && preg_match('/^'.$side.'-[1-9][0-9]?$/D', $row['id']) && ! isset($ids[$side][$row['id']]));
                $ids[$side][$row['id']] = true;
            }
        }

        $pairs = $matching['pairs'];
        NativeRules::check(is_array($pairs) && count($pairs) === count($ids['left']) && count($pairs) === count($ids['right']));
        foreach ($pairs as $left => $right) {
            NativeRules::check(is_string($right) && isset($ids['left'][$left], $ids['right'][$right]));
            unset($ids['right'][$right]);
        }
    }
}
