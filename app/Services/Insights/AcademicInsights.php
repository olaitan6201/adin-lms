<?php

namespace App\Services\Insights;

use App\Enums\EnrolmentStatus;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class AcademicInsights
{
    public function __construct(
        private InsightScope $scope,
        private ReportSelection $selection,
        private CourseActivity $courses,
        private LearnerActivity $learners,
        private AssessmentActivity $assessments,
    ) {}

    /** @param array{session?:string,term?:string,offering?:string} $filters */
    public function build(User $user, array $filters): AcademicReport
    {
        $audience = $this->scope->audience($user);
        $selected = $this->selection->query($user, $audience, $filters)->tap(ReportLimit::apply(...))->get()->keyBy('id');
        foreach ($selected as $course) {
            $course->label = $course->external_offering_id ?? $course->title ?? $course->id;
            $course->term = $course->session.' · Semester '.$course->position;
        }

        $options = $this->selection->options($user, $audience, $filters);

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
}
