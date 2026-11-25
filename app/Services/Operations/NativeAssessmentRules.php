<?php

namespace App\Services\Operations;

use App\Enums\Assessment\ItemKind;
use App\Enums\Assessment\RoundingRule;
use App\Http\Requests\Assessment\AssessmentUpload;
use Brick\Math\BigDecimal;

final class NativeAssessmentRules
{
    public function validate(mixed $data, int $modules, array &$entries): void
    {
        NativeRules::fields($data, ['policy', 'items', 'banks']);
        NativeQuestionRules::banks($data['banks']);
        NativeRules::rows($data['items'], 50);
        if ($data['policy'] === null) {
            NativeRules::check(! $data['items'] && $data['banks']);

            return;
        }
        $policy = $data['policy'];
        NativeRules::fields($policy, ['rounding', 'boundaries']);
        NativeRules::check(is_string($policy['rounding']) && RoundingRule::tryFrom($policy['rounding']) !== null);
        NativeRules::rows($policy['boundaries'], 40, 1);
        $bounds = [];
        foreach ($policy['boundaries'] as $boundary) {
            NativeRules::fields($boundary, ['minimum', 'grade']);
            NativeRules::string($boundary['grade'], 30);
            $minimum = (string) NativeRules::number($boundary['minimum'], 100, false)->strippedOfTrailingZeros();
            NativeRules::check(! isset($bounds[$minimum]));
            $bounds[$minimum] = true;
        }
        NativeRules::check(isset($bounds[0]));
        $weights = BigDecimal::zero();
        foreach ($data['items'] as $item) {
            NativeRules::fields($item, ['title', 'kind', 'weight', 'maximum', 'module', 'rubric', 'definition']);
            NativeRules::string($item['title'], 191);
            $weights = $weights->plus(NativeRules::number($item['weight'], 100, false));
            $maximum = NativeRules::number($item['maximum'], 1000000);
            NativeRules::check(is_string($item['kind']) && ItemKind::tryFrom($item['kind']) !== null);
            NativeRules::check($item['module'] === null || (is_int($item['module']) && $item['module'] >= 0 && $item['module'] < $modules));
            NativeRubric::validate($item['rubric'], $item['kind'], $maximum);
            match ($item['kind']) {
                'assignment' => $this->assignment($item['definition'], $entries),
                'exam' => $this->exam($item['definition'], $data['banks'], $maximum),
                default => NativeRules::check($item['definition'] === null),
            };
        }
        NativeRules::check($weights->isEqualTo(100), 'Assessment weights must total 100%.');
    }

    private function assignment(mixed $row, array &$entries): void
    {
        NativeRules::fields($row, ['instructions', 'max_bytes', 'accepted_formats', 'editable', 'group_work', 'late_policy', 'opens_at', 'due_at', 'closes_at', 'references']);
        NativeRules::string($row['instructions'], 30000);
        NativeRules::rows($row['accepted_formats'], 20, 1);
        foreach ($row['accepted_formats'] as $format) {
            NativeRules::check(in_array($format, AssessmentUpload::FORMATS, true));
        }
        NativeRules::fields($row['late_policy'], ['allow']);
        NativeRules::check(is_bool($row['editable']) && is_bool($row['group_work']) && is_bool($row['late_policy']['allow']));
        NativeRules::check(is_int($row['max_bytes']) && $row['max_bytes'] >= 1 && $row['max_bytes'] <= 20971520);
        foreach (['opens_at', 'due_at', 'closes_at'] as $key) {
            NativeRules::stamp($row[$key]);
        }
        NativeRules::check($row['opens_at'] <= $row['due_at'] && $row['due_at'] <= $row['closes_at']);
        NativeRules::rows($row['references'], 10);
        foreach ($row['references'] as $ref) {
            PackageAttachments::consume($ref, $entries, true);
        }
    }

    private function exam(mixed $row, array $banks, BigDecimal $maximum): void
    {
        NativeRules::fields($row, ['opens_at', 'closes_at', 'duration_seconds', 'max_attempts', 'shuffle_options', 'slots']);
        NativeRules::stamp($row['opens_at']);
        NativeRules::stamp($row['closes_at']);
        NativeRules::check($row['opens_at'] < $row['closes_at'] && is_bool($row['shuffle_options']));
        NativeRules::check(is_int($row['duration_seconds']) && $row['duration_seconds'] >= 1 && $row['duration_seconds'] <= 86400);
        NativeRules::check(is_int($row['max_attempts']) && $row['max_attempts'] >= 1 && $row['max_attempts'] <= 100);
        NativeRules::rows($row['slots'], 200, 1);
        $sum = BigDecimal::zero();
        $used = [];
        $draws = [];
        foreach ($row['slots'] as $slot) {
            NativeRules::fields($slot, ['points', 'fixed', 'draw']);
            $sum = $sum->plus(NativeRules::number($slot['points'], 1000000));
            if ($slot['fixed'] !== null) {
                NativeRules::rows($slot['fixed'], 3, 3);
                [$b, $q, $v] = $slot['fixed'];
                NativeRules::check($slot['draw'] === null && is_int($b) && is_int($q) && is_int($v) && isset($banks[$b]['questions'][$q][$v]));
                $used[$b][$q] = true;
            } else {
                $b = $slot['draw'];
                NativeRules::check(is_int($b) && isset($banks[$b]));
                $draws[$b] = ($draws[$b] ?? 0) + 1;
            }
        }
        foreach ($draws as $b => $needed) {
            NativeRules::check(count($banks[$b]['questions']) >= $needed + count($used[$b] ?? []), 'Random question pool is too small.');
        }
        NativeRules::check($sum->isEqualTo($maximum), 'Exam slots must total the maximum score.');
    }
}
