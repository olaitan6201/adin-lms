<?php

namespace App\Services\Assessment;

use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionVersion;
use Illuminate\Support\Collection;

class QuestionBankBrowser
{
    public function __construct(private QuestionDefinition $definition) {}

    public function latest(string $course, array $filters = []): Collection
    {
        return QuestionVersion::query()
            ->whereHas('question.bank', fn ($query) => $query->where('course_id', $course))
            ->where('revision', fn ($query) => $query->from('question_versions as latest')
                ->selectRaw('max(latest.revision)')
                ->whereColumn('latest.question_id', 'question_versions.question_id'))
            ->when($filters['q'] ?? null, fn ($query, $term) => $query->where('prompt', 'like', '%'.$term.'%'))
            ->when($filters['kind'] ?? null, fn ($query, $kind) => $query->where('kind', $kind))
            ->when($filters['topic'] ?? null, fn ($query, $topic) => $query->whereHas(
                'question.bank',
                fn ($bank) => $bank->where('topic', $topic),
            ))
            ->with('question.bank')
            ->orderBy('question_versions.id')
            ->limit(200)
            ->get()
            ->map(fn (QuestionVersion $version): array => [
                'id' => $version->id,
                'question_id' => $version->question_id,
                'topic' => $version->question->bank->topic,
                'kind' => $version->kind->value,
                'prompt' => $version->prompt,
                'revision' => $version->revision,
            ]);
    }

    public function topics(string $course): Collection
    {
        return QuestionBank::where('course_id', $course)
            ->orderBy('topic')
            ->pluck('topic');
    }

    public function findLatest(Question $question, string $course): QuestionVersion
    {
        return QuestionVersion::where('question_id', $question->id)
            ->whereHas('question.bank', fn ($query) => $query->where('course_id', $course))
            ->orderByDesc('revision')
            ->firstOrFail();
    }

    public function detail(QuestionVersion $version): array
    {
        return $this->definition->preview($version) + [
            'topic' => $version->question->bank->topic,
            'history' => QuestionVersion::where('question_id', $version->question_id)
                ->orderByDesc('revision')
                ->get(['id', 'revision', 'prompt'])
                ->map(fn (QuestionVersion $item): array => $item->only('id', 'revision', 'prompt')),
        ];
    }
}
