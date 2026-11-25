<?php

namespace App\Services\Lecturer;

use App\Models\Offering;
use App\Models\Semester;
use App\Models\TeachingAllocation;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class LecturerWorkloadService
{
    public function __construct(private readonly WorkloadTotalsService $totals) {}

    /**
     * @return array{terms: list<array{id: string, label: string}>, selected_term: ?string, classes: list<array<string, mixed>>, totals: array{classes: int, enrolled: int, completed: int, released_results: int}}
     */
    public function forUser(User $user, ?string $termId = null): array
    {
        $terms = $this->terms($user);
        $selectedTerm = $this->selectedTerm($terms, $termId);
        $offerings = $this->offerings($user, $selectedTerm);
        $summaries = $this->totals->forOfferings($offerings->pluck('id'));
        $classes = $offerings->map(fn (Offering $offering): array => [
            ...$this->details($offering),
            'totals' => $summaries->get($offering->id),
            'report_url' => route('workload.show', $offering),
        ])->values()->all();

        return [
            'terms' => $terms,
            'selected_term' => $selectedTerm,
            'classes' => $classes,
            'totals' => [
                'classes' => count($classes),
                'enrolled' => array_sum($summaries->pluck('enrolled')->all()),
                'completed' => array_sum($summaries->pluck('completed')->all()),
                'released_results' => array_sum($summaries->pluck('released_results')->all()),
            ],
        ];
    }

    public function isAllocatedTo(User $user, Offering $offering): bool
    {
        return AllocatedClasses::forUser($user)->where('teaching_allocations.offering_id', $offering->id)->exists();
    }

    /** @return array{class: array<string, mixed>, allocation: array{lecturer: string, staff_number: string}, totals: array{enrolled: int, completed: int, released_results: int, average_percent: ?string}} */
    public function classReport(User $user, Offering $offering): array
    {
        $offering->loadMissing('curriculumCourse.course', 'semester.session');
        $allocation = $this->allocations($user, $offering)->with('lecturer.user:id,full_name')->firstOrFail();

        return [
            'class' => $this->details($offering),
            'allocation' => [
                'lecturer' => $allocation->lecturer->user->full_name,
                'staff_number' => $allocation->lecturer->staff_number,
            ],
            'totals' => $this->totals->forOfferings(collect([$offering->id]))->get($offering->id),
        ];
    }

    /** @param list<array{id: string, label: string}> $terms */
    private function selectedTerm(array $terms, ?string $termId): ?string
    {
        if ($terms === []) {
            return null;
        }

        $selected = $termId === null || $termId === '' ? $terms[0] : collect($terms)->firstWhere('id', $termId);
        if ($selected === null) {
            throw new NotFoundHttpException;
        }

        return $selected['id'];
    }

    /** @return list<array{id: string, label: string}> */
    private function terms(User $user): array
    {
        return Semester::query()
            ->join('academic_sessions', 'academic_sessions.id', '=', 'semesters.session_id')
            ->join('offerings', 'offerings.semester_id', '=', 'semesters.id')
            ->whereIn('offerings.id', AllocatedClasses::forUser($user))
            ->select('semesters.id', 'semesters.position', 'academic_sessions.label', 'academic_sessions.starts_on as session_start', 'semesters.starts_on as term_start')
            ->distinct()
            ->orderByDesc('session_start')
            ->orderByDesc('term_start')
            ->orderByDesc('semesters.id')
            ->get()
            ->map(fn (Semester $semester): array => [
                'id' => $semester->id,
                'label' => $semester->label.' · Semester '.$semester->position,
            ])->all();
    }

    private function offerings(User $user, ?string $termId): Collection
    {
        if ($termId === null) {
            return collect();
        }

        return Offering::query()
            ->whereIn('offerings.id', AllocatedClasses::forUser($user))
            ->leftJoin('curriculum_courses', 'curriculum_courses.id', '=', 'offerings.curriculum_course_id')
            ->leftJoin('courses', 'courses.id', '=', 'curriculum_courses.course_id')
            ->where('offerings.semester_id', $termId)
            ->select('offerings.*')
            ->with(['curriculumCourse.course', 'semester.session'])
            ->orderBy('courses.code')
            ->orderBy('offerings.section')
            ->orderBy('offerings.id')
            ->get();
    }

    private function allocations(User $user, Offering $offering): Builder
    {
        return TeachingAllocation::query()
            ->where('offering_id', $offering->id)
            ->whereHas('lecturer', fn (Builder $query) => $query->where('user_id', $user->id));
    }

    /** @return array<string, mixed> */
    private function details(Offering $offering): array
    {
        $entry = $offering->curriculumCourse;
        $semester = $offering->semester;

        return [
            'id' => $offering->id,
            'code' => $entry?->course?->code ?? $offering->external_offering_id ?? $offering->id,
            'title' => $entry?->title ?? 'Course title pending',
            'section' => $offering->section,
            'status' => $offering->status->value,
            'credits' => $entry?->credits,
            'term' => $semester?->session === null ? null : $semester->session->label.' · Semester '.$semester->position,
        ];
    }
}
