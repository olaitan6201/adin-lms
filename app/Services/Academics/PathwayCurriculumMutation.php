<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use App\Enums\PathwayCurriculumAuditAction;
use App\Enums\PermissionCode;
use App\Models\Curriculum;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class PathwayCurriculumMutation
{
    public function __construct(private ScopedAuthority $authority, private AcademicCoreAudit $audit) {}

    /** @param Closure(Curriculum): (array<string, mixed>|null) $change */
    public function apply(
        string $id,
        CurriculumStatus $expected,
        User $actor,
        PathwayCurriculumAuditAction $action,
        Closure $change,
    ): Curriculum {
        $this->authorize($actor, $action === PathwayCurriculumAuditAction::Approved
            ? PermissionCode::CurriculumApprove
            : PermissionCode::CurriculumEdit);

        return DB::transaction(function () use ($id, $expected, $actor, $action, $change): Curriculum {
            $curriculum = $this->lock($id, $expected);
            $details = $change($curriculum);
            if ($details !== null) {
                $this->record($actor, $curriculum, $action, $details);
            }

            return $curriculum;
        }, 3);
    }

    public function authorize(User $actor, PermissionCode $permission): void
    {
        abort_unless($this->authority->institutionAllows($actor, $permission), 403);
    }

    public function lock(string $id, CurriculumStatus $expected): Curriculum
    {
        $curriculum = Curriculum::lockForUpdate()->findOrFail(strtolower($id));
        if ($curriculum->academic_pathway_id === null || $curriculum->academic_programme_id === null) {
            throw ValidationException::withMessages(['status' => 'Use the legacy catalogue for this curriculum.']);
        }

        if ($curriculum->status !== $expected) {
            throw ValidationException::withMessages(['status' => "This action requires a {$expected->value} curriculum."]);
        }

        return $curriculum;
    }

    /** @param array<string, mixed> $details */
    public function record(User $actor, Curriculum $curriculum, PathwayCurriculumAuditAction $action, array $details): void
    {
        $this->audit->record($actor, $curriculum, $action, $details);
    }
}
