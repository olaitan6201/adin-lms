<?php

namespace App\Services\Insights;

use App\Enums\EnrolmentStatus;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

final class CohortReports
{
    public function __construct(private ReportSelection $selection) {}

    public function completion(User $user, ReportAudience $audience, array $filters): InsightTable
    {
        $courses = $this->selection->query($user, $audience, $filters);
        $members = $this->registrations($user, $audience);
        $counts = DB::query()->fromSub($courses, 'course')->leftJoinSub($members, 'member', 'member.offering_id', '=', 'course.id');
        $fields = 'count(distinct course.id) as courses, count(member.id) as registrations, count(member.completed_at) as completed';
        $total = (clone $counts)->selectRaw($fields)->first();
        $departments = $counts->select('course.department')->selectRaw($fields)->groupBy('course.department')
            ->orderBy('course.department')->tap(ReportLimit::apply(...))->get();
        $table = new InsightTable(['Scope', 'Offerings', 'Registrations', 'Completed', 'Completion rate']);
        foreach ($departments as $department) {
            $table->rows[] = $this->completionRow($department->department ?? 'Unassigned', $department);
        }
        if (count($table->rows) === ReportLimit::ROWS) {
            throw new ReportLimit;
        }
        $table->rows[] = $this->completionRow($audience === ReportAudience::Institution ? 'Institution total' : 'Selection total', $total);

        return $table;
    }

    public function attendance(User $user, ReportAudience $audience, array $filters): InsightTable
    {
        $courses = $this->selection->query($user, $audience, $filters);
        $counts = DB::query()->fromSub($courses, 'course')->join('classes as cl', 'cl.offering_id', '=', 'course.id')
            ->joinSub($this->registrations($user, $audience), 'member', 'member.offering_id', '=', 'course.id')
            ->leftJoin('attendance as a', fn ($join) => $join->on('a.class_id', '=', 'cl.id')->on('a.user_id', '=', 'member.user_id'))
            ->select('course.external_offering_id', 'cl.title')->selectRaw("count(member.id) - count(a.id) as unmarked,
                sum(case when a.status = 'present' then 1 else 0 end) as present,
                sum(case when a.status = 'absent' then 1 else 0 end) as absent,
                sum(case when a.status = 'excused' then 1 else 0 end) as excused")
            ->groupBy('course.id', 'course.external_offering_id', 'cl.id', 'cl.title')
            ->orderBy('course.external_offering_id')->orderBy('cl.title')->orderBy('cl.id')->tap(ReportLimit::apply(...))->get();
        $table = new InsightTable(['Offering', 'Class', 'Present', 'Absent', 'Excused', 'Unmarked']);
        foreach ($counts as $row) {
            $table->rows[] = [$row->external_offering_id, $row->title, (int) $row->present, (int) $row->absent, (int) $row->excused, (int) $row->unmarked];
        }

        return $table;
    }

    public function engagement(User $user, ReportAudience $audience, array $filters): InsightTable
    {
        $courses = $this->selection->query($user, $audience, $filters);
        $visits = DB::table('lesson_progress as lp')->join('modules as m', 'm.id', '=', 'lp.module_id')
            ->when($audience === ReportAudience::Student, ReportRelease::lesson(...))
            ->whereNotNull('lp.last_seen')->select('lp.enrolment_id', 'm.offering_id')
            ->selectRaw('count(*) as visits')->groupBy('lp.enrolment_id', 'm.offering_id');
        $data = DB::query()->fromSub($courses, 'course')
            ->leftJoinSub($this->registrations($user, $audience), 'member', 'member.offering_id', '=', 'course.id')
            ->leftJoinSub($visits, 'v', fn ($q) => $q->on('v.enrolment_id', '=', 'member.id')->on('v.offering_id', '=', 'course.id'))
            ->select('course.external_offering_id', 'course.title')->selectRaw('count(member.id) as registrations,
                count(v.enrolment_id) as engaged, coalesce(sum(v.visits), 0) as lessons')
            ->groupBy('course.id', 'course.external_offering_id', 'course.title')
            ->orderBy('course.external_offering_id')->orderBy('course.id')->tap(ReportLimit::apply(...))->get();
        $table = new InsightTable(['Course', 'Registrations', 'Engaged', 'Lesson records visited', 'Engagement rate']);
        foreach ($data as $row) {
            $table->rows[] = [$row->external_offering_id ?? $row->title, (int) $row->registrations, (int) $row->engaged,
                (int) $row->lessons, $this->percentage($row->engaged, $row->registrations)];
        }

        return $table;
    }

    public function examinations(User $user, ReportAudience $audience, array $filters): InsightTable
    {
        $courses = $this->selection->query($user, $audience, $filters);
        $scores = DB::table('assessment_scores as sc')
            ->joinSub($this->registrations($user, $audience), 'member', 'member.id', '=', 'sc.enrolment_id')
            ->where('sc.released_at', '<=', now())->select('sc.item_id', 'sc.points', 'member.offering_id')
            ->selectRaw('row_number() over (partition by sc.enrolment_id, sc.item_id order by sc.revision desc) as version_rank');
        $exams = DB::query()->fromSub($courses, 'course')->join('gradebooks as b', 'b.offering_id', '=', 'course.id')
            ->join('assessment_items as i', 'i.gradebook_id', '=', 'b.id')->join('examinations as x', 'x.item_id', '=', 'i.id')
            ->leftJoinSub($scores, 'score', fn ($j) => $j->on('score.item_id', '=', 'i.id')->on('score.offering_id', '=', 'course.id')->where('score.version_rank', 1))
            ->select('course.external_offering_id', 'i.title', 'i.maximum_score')->selectRaw('count(score.points) as released, avg(score.points) as mean_points')
            ->groupBy('course.external_offering_id', 'i.id', 'i.title', 'i.maximum_score')
            ->orderBy('course.external_offering_id')->orderBy('i.title')->orderBy('i.id')->tap(ReportLimit::apply(...))->get();
        $table = new InsightTable(['Offering', 'Examination', 'Released scores', 'Mean points', 'Maximum points']);
        foreach ($exams as $exam) {
            $table->rows[] = [$exam->external_offering_id, $exam->title, (int) $exam->released,
                $exam->released ? number_format((float) $exam->mean_points, 2, '.', '') : '—', (string) $exam->maximum_score];
        }

        return $table;
    }

    private function registrations(User $user, ReportAudience $audience): Builder
    {
        return DB::table('enrolments as e')->join('students as s', 's.id', '=', 'e.student_id')
            ->where('e.status', EnrolmentStatus::Registered)
            ->when($audience === ReportAudience::Student, fn ($q) => $q->where('s.user_id', $user->id))
            ->select('e.id', 'e.offering_id', 'e.completed_at', 's.user_id');
    }

    private function completionRow(string $scope, object $counts): array
    {
        $rate = $this->percentage($counts->completed, $counts->registrations);

        return [$scope, (int) $counts->courses, (int) $counts->registrations, (int) $counts->completed, $rate];
    }

    private function percentage(int $count, int $denominator): string
    {
        return $denominator ? number_format(100 * $count / $denominator, 2).'%' : '—';
    }
}
