<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use App\Enums\PermissionCode;
use App\Enums\TeachingPlanStatus;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class OfferingDeliveryPage
{
    public function __construct(private ScopedAuthority $authority) {}

    /**
     * @return array{
     *     offerings: Collection<int, object>, entries: Collection<int, object>,
     *     terms: Collection<int, object>, modes: list<string>, pendingPlans: Collection<int, object>
     * }
     */
    public function read(User $user): array
    {
        abort_unless($this->authority->institutionAllows($user, PermissionCode::OfferingsManage), 403);

        return [
            'offerings' => $this->offerings(),
            'entries' => $this->legacyEntries(),
            'terms' => $this->terms(),
            'modes' => OfferingLifecycle::MODES,
            'pendingPlans' => $this->pendingPlans(),
        ];
    }

    /** @return Collection<int, object> */
    private function offerings(): Collection
    {
        return DB::table('offerings')
            ->orderBy('external_offering_id')
            ->get([
                'id',
                'external_offering_id',
                'status',
                'curriculum_course_id',
                'semester_id',
                'section',
                'delivery_mode',
                'copied_from',
            ]);
    }

    /** @return Collection<int, object> */
    private function legacyEntries(): Collection
    {
        return DB::table('curriculum_courses as c')
            ->join('curricula', 'curricula.id', '=', 'c.curriculum_id')
            ->join('courses', 'courses.id', '=', 'c.course_id')
            ->join('programmes', 'programmes.id', '=', 'curricula.programme_id')
            ->whereNull('curricula.academic_pathway_id')
            ->whereNull('c.course_revision_id')
            ->where('curricula.status', CurriculumStatus::Approved)
            ->orderBy('courses.code')
            ->get(['c.id', 'c.title', 'courses.code', 'curricula.version', 'programmes.name']);
    }

    /** @return Collection<int, object> */
    private function terms(): Collection
    {
        return DB::table('semesters')
            ->join('academic_sessions', 'semesters.session_id', '=', 'academic_sessions.id')
            ->orderByDesc('semesters.starts_on')
            ->get(['semesters.id', 'academic_sessions.label', 'semesters.position']);
    }

    /** @return Collection<int, object> */
    private function pendingPlans(): Collection
    {
        return DB::table('teaching_plans')
            ->join('offerings', 'offerings.id', '=', 'teaching_plans.offering_id')
            ->where('teaching_plans.status', TeachingPlanStatus::Submitted)
            ->orderBy('teaching_plans.submitted_at')
            ->get(['teaching_plans.offering_id', 'offerings.external_offering_id', 'teaching_plans.revision']);
    }
}
