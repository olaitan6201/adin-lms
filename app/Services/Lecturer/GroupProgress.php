<?php

namespace App\Services\Lecturer;

use App\Enums\EnrolmentStatus;
use App\Models\Offering;
use Illuminate\Database\Query\JoinClause;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class GroupProgress
{
    public function forOffering(Offering $offering): Collection
    {
        $completed = DB::table('lesson_progress')->join('modules', 'modules.id', '=', 'lesson_progress.module_id')
            ->where('modules.offering_id', $offering->id)->whereNotNull('lesson_progress.completed_at')
            ->selectRaw('enrolment_id, COUNT(*) as lessons')->groupBy('enrolment_id');

        return DB::table('study_groups as groups_list')->where('groups_list.offering_id', $offering->id)
            ->leftJoin('group_members', 'group_members.group_id', '=', 'groups_list.id')
            ->leftJoin('enrolments', fn (JoinClause $join) => $join->on('enrolments.id', '=', 'group_members.enrolment_id')
                ->on('enrolments.offering_id', '=', 'groups_list.offering_id')->where('enrolments.status', EnrolmentStatus::Registered->value))
            ->leftJoinSub($completed, 'completed', 'completed.enrolment_id', '=', 'enrolments.id')
            ->groupBy('groups_list.id', 'groups_list.name')->orderBy('groups_list.name')->orderBy('groups_list.id')
            ->get(['groups_list.id', 'groups_list.name', DB::raw('COUNT(enrolments.id) as members'),
                DB::raw('COALESCE(SUM(completed.lessons), 0) as lessons')])
            ->map(fn ($row) => ['id' => $row->id, 'name' => $row->name, 'members' => (int) $row->members, 'lessons' => (int) $row->lessons]);
    }
}
