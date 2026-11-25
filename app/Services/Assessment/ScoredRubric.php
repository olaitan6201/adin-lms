<?php

namespace App\Services\Assessment;

use Brick\Math\BigDecimal;
use Illuminate\Validation\ValidationException;

final class ScoredRubric
{
    /** @return array{points:string,feedback:list<array<string,string|int|null>>} */
    public function score(?array $rubric, array $selections): array
    {
        $criteria = $rubric['criteria'] ?? [];
        if ($criteria === []) {
            if ($selections !== []) {
                throw ValidationException::withMessages(['selections' => 'This item does not use a scored rubric.']);
            }

            return ['points' => '0', 'feedback' => []];
        }

        $selected = [];
        foreach ($selections as $selection) {
            if (! is_array($selection) || ! is_string($selection['criterion'] ?? null)) {
                throw ValidationException::withMessages(['selections' => 'Each selection needs a criterion and level.']);
            }

            $key = $selection['criterion'];
            if (isset($selected[$key])) {
                throw ValidationException::withMessages(['selections' => 'A criterion may be selected only once.']);
            }

            $selected[$key] = $selection;
        }

        $total = BigDecimal::zero();
        $feedback = [];
        foreach ($criteria as $position => $criterion) {
            $selection = $selected[$criterion['id']] ?? null;
            if ($selection === null) {
                throw ValidationException::withMessages(['selections' => 'Select a level for every rubric criterion.']);
            }

            $level = collect($criterion['levels'])->firstWhere('id', $selection['level'] ?? null);
            if ($level === null) {
                throw ValidationException::withMessages(['selections' => 'The selected level does not belong to this criterion.']);
            }

            $total = $total->plus((string) $level['points']);
            $feedback[] = [
                'criterion_key' => $criterion['id'],
                'criterion_title' => $criterion['title'],
                'criterion_description' => $criterion['description'],
                'level_key' => $level['id'],
                'level_label' => $level['label'],
                'level_description' => $level['description'],
                'points' => (string) $level['points'],
                'feedback' => $selection['feedback'] ?? null,
                'position' => $position,
            ];
        }

        if (count($selected) !== count($criteria)) {
            throw ValidationException::withMessages(['selections' => 'Selections contain an unknown rubric criterion.']);
        }

        return ['points' => (string) $total, 'feedback' => $feedback];
    }
}
