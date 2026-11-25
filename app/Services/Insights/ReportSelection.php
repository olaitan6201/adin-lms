<?php

namespace App\Services\Insights;

use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

final class ReportSelection
{
    public function __construct(private InsightScope $scope) {}

    public function query(User $user, ReportAudience $audience, array $filters): Builder
    {
        $base = $this->scope->offerings($user, $audience)->reorder();
        if (isset($filters['offering'])) {
            $base->where('o.id', $filters['offering']);
            abort_unless((clone $base)->exists(), 404);
        }

        return $base->when($filters['session'] ?? null, fn ($q, $id) => $q->where('s.id', $id))
            ->when($filters['term'] ?? null, fn ($q, $id) => $q->where('t.id', $id));
    }

    public function options(User $user, ReportAudience $audience, array $filters): array
    {
        $base = $this->scope->offerings($user, $audience)->reorder();
        $sessions = $audience === ReportAudience::Institution ? DB::table('academic_sessions as s') : clone $base;
        $sessions = $sessions->whereNotNull('s.id')->select('s.id', 's.label')->distinct()->orderBy('s.label')->limit(500)->get();
        $base->when($filters['session'] ?? null, fn ($q, $id) => $q->where('s.id', $id));
        $terms = (clone $base)->whereNotNull('t.id')->select('t.id', 's.label', 't.position')->distinct()
            ->orderBy('s.label')->orderBy('t.position')->limit(500)->get()->map(fn ($t) => ['id' => $t->id, 'label' => "$t->label · Semester $t->position"]);
        $courses = $base->when($filters['term'] ?? null, fn ($q, $id) => $q->where('t.id', $id))
            ->select('o.id', 'o.external_offering_id', 'cc.title')->orderBy('o.external_offering_id')->orderBy('o.id')->limit(500)
            ->get()->map(fn ($o) => ['id' => $o->id, 'label' => $o->external_offering_id ?? $o->title ?? $o->id]);

        return ['session' => $sessions->all(), 'term' => $terms->all(), 'offering' => $courses->all()];
    }
}
