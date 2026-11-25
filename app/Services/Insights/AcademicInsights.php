<?php

namespace App\Services\Insights;

use App\Enums\EnrolmentStatus;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class AcademicInsights
{
    public function __construct(
        private InsightScope $scope,
        private CourseActivity $courses,
        private LearnerActivity $learners,
        private AssessmentActivity $assessments,
    ) {}

    /** @param array{session?:string,term?:string,offering?:string} $filters */
    public function build(User $user, array $filters): AcademicReport
    {
        $audience = $this->scope->audience($user);
        $visible = $this->scope->offerings($user, $audience)->get()->keyBy('id');
        foreach ($visible as $course) {
            $course->label = $course->external_offering_id ?? $course->title ?? $course->id;
            $course->term = $course->session.' · Semester '.$course->position;
        }

        if (isset($filters['offering'])) {
            abort_unless($visible->has($filters['offering']), 404);
        }

        $selected = $visible;
        $options = ['session' => $audience === ReportAudience::Institution
            ? DB::table('academic_sessions')->orderByDesc('starts_on')->get(['id', 'label'])->map(fn ($row) => (array) $row)->all()
            : $this->options($visible, 'session_id', 'session')];
        if (isset($filters['session'])) {
            $selected = $selected->where('session_id', $filters['session']);
        }

        $options['term'] = $this->options($selected, 'term_id', 'term');
        if (isset($filters['term'])) {
            $selected = $selected->where('term_id', $filters['term']);
        }

        $options['offering'] = $this->options($selected, 'id', 'label');
        if (isset($filters['offering'])) {
            $selected = $selected->only($filters['offering']);
        }

        $roster = DB::table('enrolments as e')->join('students as p', 'p.id', '=', 'e.student_id')
            ->leftJoin('users as u', 'u.id', '=', 'p.user_id')->where('e.status', EnrolmentStatus::Registered)
            ->whereIn('e.offering_id', $selected->keys());
        if ($audience === ReportAudience::Student) {
            $roster->where('p.user_id', $user->id);
        }

        $table = new InsightTable;
        $this->courses->append($table, $selected, $audience, $user);
        $this->learners->append($table, $roster, $selected, $audience);
        $this->assessments->append($table, $roster, $selected, $audience);

        return new AcademicReport($audience, $filters, $options, $table);
    }

    private function options(Collection $courses, string $key, string $label): array
    {
        return $courses->whereNotNull($key)->unique($key)->map(fn ($c) => ['id' => $c->$key, 'label' => $c->$label])->values()->all();
    }
}
