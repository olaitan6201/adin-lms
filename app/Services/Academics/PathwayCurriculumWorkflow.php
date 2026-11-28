<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use App\Enums\PathwayCurriculumAuditAction;
use App\Enums\PermissionCode;
use App\Enums\StructureRegisterStatus;
use App\Models\AcademicPathway;
use App\Models\Curriculum;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class PathwayCurriculumWorkflow
{
    public function __construct(
        private PathwayCurriculumMutation $mutation,
        private PathwayCurriculumAssignmentRules $assignments,
        private PathwayCurriculumChoices $choices,
        private PathwayCurriculumGraph $graph,
        private PathwayCurriculumFork $forker,
    ) {}

    public function create(User $actor, string $pathwayId, string $frameworkRevision): Curriculum
    {
        $this->mutation->authorize($actor, PermissionCode::CurriculumEdit);

        return DB::transaction(function () use ($actor, $pathwayId, $frameworkRevision): Curriculum {
            $draft = $this->nextVersion($this->lockPathway($pathwayId), $frameworkRevision);
            $this->mutation->record($actor, $draft, PathwayCurriculumAuditAction::Created, [
                'academic_pathway_id' => $draft->academic_pathway_id,
                'version' => $draft->version,
                'framework_revision' => $draft->framework_revision,
            ]);

            return $draft;
        }, 3);
    }

    public function review(User $actor, string $id): Curriculum
    {
        return $this->mutation->apply($id, CurriculumStatus::Draft, $actor, PathwayCurriculumAuditAction::Reviewed,
            function (Curriculum $version): array {
                $this->validate($version);
                $version->forceFill(['status' => CurriculumStatus::Reviewed])->save();

                return ['status' => CurriculumStatus::Reviewed->value];
            });
    }

    public function approve(User $actor, string $id): Curriculum
    {
        return $this->mutation->apply($id, CurriculumStatus::Reviewed, $actor, PathwayCurriculumAuditAction::Approved,
            function (Curriculum $version) use ($actor): array {
                $this->validate($version);
                $version->forceFill([
                    'status' => CurriculumStatus::Approved,
                    'approved_by' => $actor->id,
                    'approved_at' => now(),
                ])->save();

                return ['status' => CurriculumStatus::Approved->value];
            });
    }

    public function fork(User $actor, string $id): Curriculum
    {
        $this->mutation->authorize($actor, PermissionCode::CurriculumEdit);

        $pathwayId = Curriculum::findOrFail(strtolower($id))->academic_pathway_id;
        if ($pathwayId === null) {
            throw ValidationException::withMessages(['status' => 'Use the legacy catalogue for this curriculum.']);
        }

        return DB::transaction(function () use ($actor, $id, $pathwayId): Curriculum {
            $pathway = $this->lockPathway($pathwayId);
            $source = $this->mutation->lock($id, CurriculumStatus::Approved);
            $this->validate($source);
            $draft = $this->nextVersion($pathway, $source->framework_revision);
            $this->forker->copy($source, $draft);
            $this->mutation->record($actor, $draft, PathwayCurriculumAuditAction::Forked, [
                'source_curriculum_id' => $source->id,
                'academic_pathway_id' => $draft->academic_pathway_id,
                'version' => $draft->version,
            ]);

            return $draft;
        }, 3);
    }

    private function lockPathway(string $id): AcademicPathway
    {
        $pathway = AcademicPathway::lockForUpdate()->find(strtolower($id));
        if ($pathway?->status !== StructureRegisterStatus::Active) {
            throw ValidationException::withMessages(['academic_pathway_id' => 'Select an active academic pathway.']);
        }

        return $pathway;
    }

    private function nextVersion(AcademicPathway $pathway, string $frameworkRevision): Curriculum
    {
        $last = Curriculum::where('academic_pathway_id', $pathway->id)
            ->orderByDesc('version')->lockForUpdate()->value('version');

        return Curriculum::forceCreate([
            'academic_pathway_id' => $pathway->id,
            'academic_programme_id' => $pathway->academic_programme_id,
            'version' => (int) $last + 1,
            'framework_revision' => $frameworkRevision,
            'status' => CurriculumStatus::Draft,
        ]);
    }

    private function validate(Curriculum $version): void
    {
        if (blank($version->framework_revision)) {
            throw ValidationException::withMessages(['framework_revision' => 'A framework revision is required before review or approval.']);
        }

        $entries = $this->assignments->complete($version);
        $this->choices->validate($version, $entries);
        $this->graph->validate($version, $entries);
    }
}
