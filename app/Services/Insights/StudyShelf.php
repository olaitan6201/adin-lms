<?php

namespace App\Services\Insights;

use App\Enums\EnrolmentStatus;
use App\Models\User;
use App\Services\Learning\LessonAccess;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class StudyShelf
{
    public function forUser(User $user, Builder $scope): array
    {
        $lessons = (clone $scope)->reorder()->join('modules as m', 'm.offering_id', '=', 'o.id')
            ->whereIn('m.id', LessonAccess::unlocked($user->id));
        $materials = ReportRelease::material((clone $lessons)->join('learning_materials as resource', 'resource.module_id', '=', 'm.id'))
            ->join('material_versions as v', 'v.material_id', '=', 'resource.id')
            ->whereNotExists(fn ($q) => $q->from('material_versions as newer')->whereColumn('newer.material_id', 'resource.id')->whereColumn('newer.revision', '>', 'v.revision'))
            ->select('resource.title', 'o.id', 'm.id as lesson', 'o.external_offering_id as context')->orderByDesc('v.created_at')->orderBy('v.id')->limit(5)->get()
            ->map(fn ($r) => ['title' => $r->title, 'context' => $r->context, 'href' => route('learning.index', $r->id, false).'#lesson-'.$r->lesson]);
        $visits = ReportRelease::lesson($lessons)->join('enrolments as e', 'e.offering_id', '=', 'o.id')->where('e.status', EnrolmentStatus::Registered)
            ->join('students as st', 'st.id', '=', 'e.student_id')->where('st.user_id', $user->id)
            ->leftJoin('lesson_progress as lp', fn ($j) => $j->on('lp.module_id', '=', 'm.id')->on('lp.enrolment_id', '=', 'e.id'))
            ->select([])->selectRaw('count(*) as available, count(lp.completed_at) as completed')->first();
        $notices = DB::table('announcements as n')->leftJoin('offerings as course', 'course.id', '=', 'n.offering_id')
            ->where(fn ($q) => $q->whereNull('n.offering_id')->orWhereIn('n.offering_id', $scope->reorder()->select('o.id')))
            ->where('n.published_at', '<=', now())->orderByDesc('n.published_at')->orderBy('n.id')->limit(5)
            ->get(['n.body', 'n.offering_id', 'course.external_offering_id'])->map(fn ($n) => [
                'title' => Str::limit($n->body, 180), 'context' => $n->external_offering_id ?? 'Institution',
                'href' => $n->offering_id ? route('community.board', $n->offering_id, false) : route('community.inbox', [], false),
            ]);

        return ['materials' => $materials, 'announcements' => $notices, 'completed' => (int) $visits->completed, 'available' => (int) $visits->available];
    }
}
