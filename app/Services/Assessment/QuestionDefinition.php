<?php

namespace App\Services\Assessment;

use App\Enums\Assessment\QuestionKind;
use App\Models\QuestionVersion;
use Illuminate\Validation\ValidationException;

class QuestionDefinition
{
    public function fromInput(array $data): array
    {
        $kind = QuestionKind::from($data['kind']);
        $options = $this->choices($kind, $data['options'] ?? null);
        $key = $this->key($kind, $data, $options);

        return [
            'kind' => $kind->value,
            'prompt' => trim($data['prompt']),
            'options' => $options,
            'marking_key' => $key,
        ];
    }

    public function form(QuestionVersion $version): array
    {
        $key = $version->marking_key ?? [];
        $matching = $key['matching'] ?? null;
        $pairs = [];

        if ($matching) {
            foreach ($matching['pairs'] as $left => $right) {
                $pairs[] = $this->label($matching['left'], $left).' => '.$this->label($matching['right'], $right);
            }
        }

        return [
            'kind' => $version->kind->value,
            'prompt' => $version->prompt,
            'options' => implode("\n", $version->options ?? []),
            'accepted' => implode("\n", $key['accepted'] ?? []),
            'pairs' => implode("\n", $pairs),
            'guide' => $key['guide'] ?? '',
        ];
    }

    public function preview(QuestionVersion $version): array
    {
        $key = $version->marking_key ?? [];

        return $this->form($version) + [
            'id' => $version->id,
            'question_id' => $version->question_id,
            'revision' => $version->revision,
            'marking_key' => $key,
        ];
    }

    public function matching(QuestionVersion $version): ?array
    {
        return $version->marking_key['matching'] ?? null;
    }

    private function choices(QuestionKind $kind, ?string $lines): array
    {
        if ($kind === QuestionKind::TrueFalse && trim((string) $lines) === '') {
            return ['True', 'False'];
        }

        return $kind->hasChoices() ? $this->lines($lines) : [];
    }

    private function key(QuestionKind $kind, array $data, array $options): array
    {
        if ($kind === QuestionKind::Matching) {
            return ['accepted' => [], 'matching' => $this->matchingInput($data['pairs'] ?? null)];
        }

        $accepted = $this->lines($data['accepted'] ?? null);
        if ($accepted === [] && trim((string) ($data['key'] ?? '')) !== '') {
            $accepted = [trim($data['key'])];
        }
        if ($kind->isObjective() && $accepted === []) {
            throw ValidationException::withMessages(['accepted' => 'Supply at least one accepted answer.']);
        }
        if ($kind->hasChoices() && (count($options) < 2 || count($accepted) !== 1 || ! in_array($accepted[0], $options, true))) {
            throw ValidationException::withMessages(['accepted' => 'Supply one accepted answer from the choices.']);
        }

        return ['accepted' => $accepted, 'guide' => trim((string) ($data['guide'] ?? ''))];
    }

    private function matchingInput(?string $lines): array
    {
        $left = [];
        $right = [];
        $pairs = [];
        foreach ($this->lines($lines) as $line) {
            if (! preg_match('/^(.+?)\s*(?:=>|=)\s*(.+)$/u', $line, $matches)) {
                throw ValidationException::withMessages(['pairs' => 'Use one left => right pair per line.']);
            }
            $leftLabel = trim($matches[1]);
            $rightLabel = trim($matches[2]);
            if (in_array($leftLabel, array_column($left, 'label'), true) || in_array($rightLabel, array_column($right, 'label'), true)) {
                throw ValidationException::withMessages(['pairs' => 'Matching labels must be unique within each side.']);
            }
            $leftId = $this->opaqueId();
            $rightId = $this->opaqueId();
            $left[] = ['id' => $leftId, 'label' => $leftLabel];
            $right[] = ['id' => $rightId, 'label' => $rightLabel];
            $pairs[$leftId] = $rightId;
        }
        if (count($pairs) < 2 || count($pairs) > 20) {
            throw ValidationException::withMessages(['pairs' => 'Supply between 2 and 20 matching pairs.']);
        }
        shuffle($right);

        return compact('left', 'right', 'pairs');
    }

    private function opaqueId(): string
    {
        return bin2hex(random_bytes(12));
    }

    private function lines(?string $value): array
    {
        return array_values(array_unique(array_filter(array_map('trim', preg_split('/\R/', (string) $value, -1, PREG_SPLIT_NO_EMPTY)))));
    }

    private function label(array $items, string $id): string
    {
        foreach ($items as $item) {
            if ($item['id'] === $id) {
                return $item['label'];
            }
        }

        return $id;
    }
}
