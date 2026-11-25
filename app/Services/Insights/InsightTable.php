<?php

namespace App\Services\Insights;

final class InsightTable
{
    public const COLUMNS = ['Course', 'Category', 'Record', 'Value'];

    /** @var list<list<string|int|null>> */
    public array $rows = [];

    /** @var array<string,int> */
    public array $totals = [];

    private int $detailBytes = 0;

    public function __construct(public readonly array $columns = self::COLUMNS) {}

    public function add(string $course, string $category, string $record, string|int $value): void
    {
        $this->detailBytes += strlen($course) + strlen($category) + strlen($record) + strlen((string) $value);
        if (count($this->rows) >= ReportLimit::ROWS || $this->detailBytes > 262144) {
            throw new ReportLimit;
        }
        $this->rows[] = [$course, $category, $record, (string) $value];
    }

    public function lines(): iterable
    {
        yield $this->columns;
        foreach ($this->totals as $key => $value) {
            yield ['', 'Total', $key, $value];
        }
        yield from $this->rows;
    }
}
