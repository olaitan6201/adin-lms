<?php

namespace App\Services\Insights;

use App\Enums\EnrolmentStatus;
use App\Enums\OfferingStatus;
use App\Enums\PermissionCode;
use App\Enums\RoleCode;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

final class InsightScope
{
    public function __construct(private ScopedAuthority $authority) {}

    public function audience(User $user): ReportAudience
    {
        if ($this->authority->institutionAllows($user, PermissionCode::RosterRead)) {
            return ReportAudience::Institution;
        }

        if ($this->grants($user)->whereIn('r.code', [RoleCode::Dean, RoleCode::HeadOfDepartment])->exists()) {
            return ReportAudience::AcademicUnit;
        }

        return $user->lecturer()->exists() ? ReportAudience::Lecturer : ReportAudience::Student;
    }

    public function offerings(User $user, ReportAudience $audience): Builder
    {
        $query = DB::table('offerings as o')
            ->leftJoin('curriculum_courses as cc', 'cc.id', '=', 'o.curriculum_course_id')
            ->leftJoin('courses as c', 'c.id', '=', 'cc.course_id')
            ->leftJoin('departments as d', 'd.id', '=', 'c.department_id')
            ->leftJoin('semesters as t', 't.id', '=', 'o.semester_id')
            ->leftJoin('academic_sessions as s', 's.id', '=', 't.session_id');
        if ($audience === ReportAudience::AcademicUnit) {
            $query->where(function (Builder $scope) use ($user): void {
                $scope->whereIn('d.id', $this->grants($user)->where('r.code', RoleCode::HeadOfDepartment)->select('a.department_id'))
                    ->orWhereIn('d.faculty_id', $this->grants($user)->where('r.code', RoleCode::Dean)->select('a.faculty_id'));
            });
        } elseif ($audience === ReportAudience::Lecturer) {
            $query->whereIn('o.id', $this->grants($user)->where('r.code', RoleCode::Lecturer)->select('a.offering_id'))
                ->whereIn('o.id', DB::table('teaching_allocations as ta')->join('lecturers as l', 'l.id', '=', 'ta.lecturer_id')
                    ->where('l.user_id', $user->id)->select('ta.offering_id'));
        } elseif ($audience === ReportAudience::Student) {
            $query->where('o.status', OfferingStatus::Published)->whereIn('o.id', DB::table('enrolments as e')
                ->join('students as p', 'p.id', '=', 'e.student_id')->where('p.user_id', $user->id)
                ->where('e.status', EnrolmentStatus::Registered)->select('e.offering_id'));
        }

        return $query->select('o.id', 'o.external_offering_id', 'o.status', 'o.approved_at', 'cc.title', 'd.code as department',
            's.label as session', 's.id as session_id', 't.id as term_id', 't.position', 's.starts_on', 's.ends_on')
            ->orderBy('o.external_offering_id')->orderBy('o.id');
    }

    private function grants(User $user): Builder
    {
        return DB::table('role_grants as g')->join('roles as r', 'r.id', '=', 'g.role_id')
            ->join('role_permissions as rp', 'rp.role_id', '=', 'r.id')
            ->join('permissions as p', 'p.id', '=', 'rp.permission_id')
            ->join('access_scopes as a', 'a.id', '=', 'g.scope_id')
            ->where('g.user_id', $user->id)->where('p.code', PermissionCode::RosterRead);
    }
}
