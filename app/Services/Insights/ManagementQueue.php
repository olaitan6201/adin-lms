<?php

namespace App\Services\Insights;

use App\Enums\Assessment\ModerationStatus;
use App\Enums\CurriculumStatus;
use App\Enums\DeliveryStatus;
use App\Enums\NotificationChannel;
use App\Enums\OfferingStatus;
use App\Enums\PermissionCode;
use App\Models\NotificationDelivery;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

final class ManagementQueue
{
    public function __construct(private ScopedAuthority $authority) {}

    public function forUser(User $user, bool $operations, bool $examOffice): Collection
    {
        $rows = collect();
        if ($operations && ($failed = NotificationDelivery::where('status', DeliveryStatus::Failed)->where('channel', NotificationChannel::Email)->count())) {
            $rows->push([
                'kind' => 'Delivery exception', 'title' => 'Failed notification deliveries', 'context' => "$failed failed",
                'action' => 'Review failed emails', 'href' => route('community.delivery.failures', [], false), 'at' => null,
            ]);
        }
        if ($examOffice) {
            $grades = DB::table('grades as g')->join('enrolments as e', 'e.id', '=', 'g.enrolment_id')
                ->join('offerings as o', 'o.id', '=', 'e.offering_id')
                ->where('g.moderation_status', ModerationStatus::Pending)->whereNull('g.published_at')
                ->whereNotExists(fn ($q) => $q->from('grades as later')->whereColumn('later.enrolment_id', 'g.enrolment_id')
                    ->whereColumn('later.revision', '>', 'g.revision'))
                ->orderBy('g.id')->limit(12)->get(['g.id', 'g.revision', 'o.external_offering_id']);
            foreach ($grades as $grade) {
                $rows->push([
                    'kind' => 'Result moderation', 'title' => $grade->external_offering_id, 'context' => "Revision {$grade->revision}",
                    'action' => 'Inspect grade evidence', 'href' => route('assessment.evidence', $grade->id, false), 'at' => null,
                ]);
            }
        }
        if ($this->authority->institutionAllows($user, PermissionCode::CurriculumApprove)) {
            $versions = DB::table('curricula as c')->join('programmes as p', 'p.id', '=', 'c.programme_id')
                ->where('c.status', CurriculumStatus::Reviewed)->orderBy('p.name')->orderBy('c.version')->limit(12)
                ->get(['c.id', 'p.name', 'c.version']);
            foreach ($versions as $v) {
                $rows->push([
                    'kind' => 'Curriculum approval', 'title' => $v->name, 'context' => "Version {$v->version} · reviewed",
                    'action' => 'Review curriculum', 'href' => route('academics.curriculum.show', $v->id, false), 'at' => null,
                ]);
            }
        }
        if ($this->authority->institutionAllows($user, PermissionCode::OfferingsManage)) {
            $offerings = DB::table('offerings as o')->leftJoin('curriculum_courses as c', 'c.id', '=', 'o.curriculum_course_id')
                ->where('o.status', OfferingStatus::Draft)->orderBy('o.external_offering_id')->limit(12)
                ->get(['o.id', 'o.external_offering_id', 'c.title']);
            foreach ($offerings as $o) {
                $rows->push([
                    'kind' => 'Draft offering', 'title' => $o->title ?? $o->external_offering_id, 'context' => $o->external_offering_id,
                    'action' => 'Prepare offering', 'href' => route('academics.delivery', ['offering' => $o->id], false).'#offering-'.$o->id, 'at' => null,
                ]);
            }
        }

        return $rows->take(12)->values();
    }

    public function tools(User $user): array
    {
        $links = [];
        foreach ([
            [PermissionCode::RosterRead, 'Student directory', 'students.index'],
            [PermissionCode::AccountsManage, 'Account directory', 'accounts.index'],
            [PermissionCode::StaffManage, 'Staff directory', 'staff.index'],
            [PermissionCode::ExaminationsManage, 'Examinations office', 'assessment.office'],
            [PermissionCode::ComplianceRead, 'Curriculum catalogue', 'academics.curriculum.show'],
            [PermissionCode::OperationsManage, 'System operations', 'operations.index'],
            [PermissionCode::OperationsManage, 'Active sessions', 'security.sessions'],
            [PermissionCode::PrivacyManage, 'Privacy cases', 'operations.privacy'],
            [PermissionCode::PortabilityManage, 'Course exchange', 'operations.courses'],
        ] as [$permission, $label, $route]) {
            if ($this->authority->institutionAllows($user, $permission)) {
                $links[] = ['label' => $label, 'href' => route($route, [], false)];
            }
        }

        return $links;
    }
}
