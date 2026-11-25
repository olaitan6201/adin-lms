<?php

namespace App\Services\Insights;

final readonly class AcademicReport
{
    /**
     * @param  array{session?:string,term?:string,offering?:string}  $filters
     * @param  array<string,list<array{id:string,label:string}>>  $options
     */
    public function __construct(
        public ReportAudience $audience,
        public array $filters,
        public array $options,
        public InsightTable $table,
    ) {}

    public function pageProps(): array
    {
        return [
            'audience' => $this->audience->value,
            'filters' => $this->filters,
            'options' => $this->options,
            'columns' => InsightTable::COLUMNS,
            'table' => ['rows' => $this->table->rows, 'totals' => $this->table->totals],
        ];
    }
}
