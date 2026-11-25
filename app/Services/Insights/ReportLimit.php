<?php

namespace App\Services\Insights;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\HttpException;

final class ReportLimit extends HttpException
{
    public const ROWS = 500;

    public function __construct()
    {
        parent::__construct(422, 'This selection exceeds the report limit (500 rows or 256 KiB of detail). Select a narrower session, semester or course, or use a summary report.');
    }

    public static function apply(Builder $query): void
    {
        $query->limit(self::ROWS + 1)->afterQuery(function (Collection $rows): Collection {
            if ($rows->count() > self::ROWS) {
                throw new self;
            }

            return $rows;
        });
    }
}
