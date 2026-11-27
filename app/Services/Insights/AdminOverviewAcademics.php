<?php

namespace App\Services\Insights;

use App\Enums\EnrolmentStatus;
use App\Enums\OfferingStatus;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Number;

final class AdminOverviewAcademics
{
    /** TODO: Define the colors for each faculty in the database */
    private const FACULTY_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#33475F'];

    /** @param array{session?: string, term?: string} $filters */
    public function selectPeriod(Builder $offerings, array $filters): string
    {
        if (isset($filters['session'])) {
            $session = DB::table('academic_sessions')
                ->where('id', $filters['session'])
                ->firstOrFail(['label']);
            $offerings->where('s.id', $filters['session']);
        }

        if (isset($filters['term'])) {
            $term = DB::table('semesters as t')
                ->join('academic_sessions as s', 's.id', '=', 't.session_id')
                ->where('t.id', $filters['term'])
                ->when($filters['session'] ?? null, function (Builder $query, string $id): void {
                    $query->where('s.id', $id);
                })
                ->firstOrFail(['s.label', 't.position']);
            $offerings->where('t.id', $filters['term']);

            return "{$term->label} · Semester {$term->position}";
        }

        return $session->label ?? 'All academic sessions';
    }

    public function snapshot(Builder $offerings): array
    {
        $registrations = (clone $offerings)
            ->join('enrolments as e', 'e.offering_id', '=', 'o.id')
            ->where('e.status', EnrolmentStatus::Registered);
        $counts = (clone $registrations)
            ->select([])
            ->selectRaw('count(*) as registrations, count(distinct e.student_id) as students, count(e.completed_at) as completed')
            ->first();
        $completion = $this->completion((int) $counts->completed, (int) $counts->registrations);
        $published = $offerings->where('o.status', OfferingStatus::Published);
        $publishedCount = (clone $published)->count();
        $lecturerCount = $published->join('teaching_allocations as ta', 'ta.offering_id', '=', 'o.id')
            ->distinct()
            ->count('ta.lecturer_id');

        return [
            'tiles' => [
                $this->tile('Registered students', Number::format((int) $counts->students), 'Distinct current registrants', 'users'),
                $this->tile('Published offerings', Number::format($publishedCount), 'Currently published', 'book'),
                $this->tile('Allocated lecturers', Number::format($lecturerCount), 'On published offerings', 'graduation'),
                $this->tile('Registrations completed', $completion === null ? null : "$completion%", 'Completion recorded on current registrations', 'layers'),
            ],
            'participation' => $this->participation($registrations),
        ];
    }

    private function participation(Builder $registrations): array
    {
        $metrics = $registrations->join('faculties as f', 'f.id', '=', 'd.faculty_id')
            ->select('f.id', 'f.name')
            ->selectRaw('count(*) as registrations, count(e.completed_at) as completed')
            ->groupBy('f.id', 'f.name')
            ->orderBy('f.name')
            ->orderBy('f.id')
            ->get()
            ->map(fn (object $faculty, int $index): array => [
                'id' => $faculty->id,
                'label' => $faculty->name,
                'value' => $this->completion((int) $faculty->completed, (int) $faculty->registrations),
                'color' => self::FACULTY_COLORS[$index % count(self::FACULTY_COLORS)],
            ])
            ->all();

        return [
            'metrics' => $metrics,
            'summary' => $metrics
                ? 'Share of current course registrations with a recorded completion, grouped by offering faculty.'
                : 'No current registrations are linked to a faculty in this scope.',
        ];
    }

    private function completion(int $completed, int $total): ?int
    {
        return $total === 0 ? null : (int) round(100 * $completed / $total);
    }

    /** @return array{label: string, value: ?string, deltaLabel: string, icon: string} */
    private function tile(string $label, ?string $value, string $deltaLabel, string $icon): array
    {
        return compact('label', 'value', 'deltaLabel', 'icon');
    }
}
