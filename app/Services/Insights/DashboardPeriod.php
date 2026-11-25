<?php

namespace App\Services\Insights;

use App\Enums\EnrolmentStatus;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

final class DashboardPeriod
{
    public function select(Builder $scope, ReportAudience $audience, array $filters): array
    {
        $institution = $audience === ReportAudience::Institution;
        $options = $institution ? DB::table('academic_sessions as s') : (clone $scope)->reorder();
        $sessions = $options->whereNotNull('s.id')->select('s.id', 's.label')->distinct()->orderByDesc('s.label')->get();
        $session = $filters['session'] ?? null;
        abort_if($session && ! $sessions->contains('id', $session), 404);
        $scope->when($session, fn ($q) => $q->where('s.id', $session));
        $options = $institution ? DB::table('semesters as t')->join('academic_sessions as s', 's.id', '=', 't.session_id')
            ->when($session, fn ($q) => $q->where('s.id', $session)) : (clone $scope)->reorder();
        $terms = $options->whereNotNull('t.id')->select('t.id', 's.label', 't.position')->distinct()
            ->orderByDesc('s.label')->orderBy('t.position')->get()->map(fn ($t) => ['id' => $t->id, 'label' => "$t->label · Semester $t->position"]);
        $term = $filters['term'] ?? null;
        abort_if($term && ! $terms->contains('id', $term), 404);
        $scope->when($term, fn ($q) => $q->where('t.id', $term));
        $summary = [
            'Offerings' => (clone $scope)->count(),
            'Registered students' => (clone $scope)->join('enrolments as e', 'e.offering_id', '=', 'o.id')
                ->where('e.status', EnrolmentStatus::Registered)->distinct()->count('e.student_id'),
            'Allocated lecturers' => (clone $scope)->join('teaching_allocations as a', 'a.offering_id', '=', 'o.id')->distinct()->count('a.lecturer_id'),
            'Participating departments' => (clone $scope)->distinct()->count('d.id'),
        ];

        return compact('session', 'term', 'sessions', 'terms', 'summary');
    }
}
