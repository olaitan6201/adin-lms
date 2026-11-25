<?php

namespace App\Services\Insights;

use App\Enums\Assessment\ModerationStatus;
use App\Enums\Learning\LessonKind;
use Illuminate\Database\Query\Builder;

final class ReportRelease
{
    public static function lesson(Builder $query): Builder
    {
        return self::window($query->where('m.kind', 'not like', LessonKind::DRAFT_PREFIX.'%'), 'm');
    }

    public static function material(Builder $query): Builder
    {
        return self::window(self::lesson($query)->whereNull('resource.restrictions'), 'resource');
    }

    public static function score(Builder $query): Builder
    {
        return $query->where('sc.released_at', '<=', now());
    }

    public static function grade(Builder $query): Builder
    {
        return $query->whereNotNull('g.approved_at')
            ->whereNotNull('g.approved_by')
            ->where('g.moderation_status', ModerationStatus::Approved)
            ->where('g.published_at', '<=', now());
    }

    private static function window(Builder $query, string $alias): Builder
    {
        return $query
            ->where(fn ($q) => $q->whereNull("$alias.opens_at")->orWhere("$alias.opens_at", '<=', now()))
            ->where(fn ($q) => $q->whereNull("$alias.closes_at")->orWhere("$alias.closes_at", '>', now()));
    }
}
