<?php

namespace App\Services\Insights;

final class InsightTable
{
    public const COLUMNS = ['Course', 'Category', 'Record', 'Value'];

    /** @var list<array{string,string,string,string}> */
    public array $rows = [];

    /** @var array<string,int> */
    public array $totals = [];

    public function add(string $course, string $category, string $record, string|int $value): void
    {
        $this->rows[] = [$course, $category, $record, (string) $value];
    }

    public function lines(): iterable
    {
        yield self::COLUMNS;
        foreach ($this->totals as $key => $value) {
            yield ['', 'Total', $key, $value];
        }
        yield from $this->rows;
    }
}
