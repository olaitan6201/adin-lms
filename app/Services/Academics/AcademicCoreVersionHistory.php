<?php

namespace App\Services\Academics;

use App\Enums\PathwayCurriculumAuditAction;
use App\Models\AuditLog;
use App\Models\Curriculum;

final class AcademicCoreVersionHistory
{
    public function read(Curriculum $version): ?array
    {
        $subject = 'curricula:'.$version->id;
        $fork = AuditLog::query()->where('subject_key', $subject)
            ->where('action', PathwayCurriculumAuditAction::Forked->value)->first();
        $sourceId = $fork?->details['source_curriculum_id'] ?? null;
        if (! is_string($sourceId)) {
            return null;
        }

        $source = Curriculum::query()->where('academic_pathway_id', $version->academic_pathway_id)
            ->find($sourceId, ['id', 'version']);
        if ($source === null) {
            return null;
        }

        $changes = AuditLog::query()->where('subject_key', $subject)->whereIn('action', [
            PathwayCurriculumAuditAction::Assigned->value,
            PathwayCurriculumAuditAction::AssignmentUpdated->value,
            PathwayCurriculumAuditAction::ChoiceAdded->value,
            PathwayCurriculumAuditAction::PrerequisiteAdded->value,
            PathwayCurriculumAuditAction::CourseOutcomeAdded->value,
            PathwayCurriculumAuditAction::ProgrammeOutcomeAdded->value,
            PathwayCurriculumAuditAction::OutcomeMapped->value,
        ])->orderBy('occurred_at')->orderBy('id')->get(['id', 'action', 'details']);

        return ['source' => $source, 'changes' => $changes];
    }
}
