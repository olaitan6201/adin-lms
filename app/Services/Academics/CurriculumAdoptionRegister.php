<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use App\Enums\OrganisationAuditAction;
use App\Enums\PermissionCode;
use App\Models\AcademicPathway;
use App\Models\Curriculum;
use App\Models\CurriculumAdoption;
use App\Models\CurriculumAdoptionDecision;
use App\Models\EntryCohort;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class CurriculumAdoptionRegister
{
    public function __construct(
        private ScopedAuthority $authority,
        private AcademicCoreAudit $audit,
    ) {}

    /** @param array{code: string, label: string} $input */
    public function createCohort(array $input, User $actor): EntryCohort
    {
        abort_unless($this->authority->institutionAllows($actor, PermissionCode::CurriculumEdit), 403);

        return DB::transaction(function () use ($input, $actor): EntryCohort {
            $cohort = EntryCohort::create($input);
            $this->audit->record($actor, $cohort, OrganisationAuditAction::Created, [
                'before' => [],
                'after' => ['code' => $cohort->code, 'label' => $cohort->label],
            ]);

            return $cohort;
        });
    }

    /** @param array{curriculum_id: string, academic_session_id: string, entry_cohort_id: string, decision_reference: string, reason: string} $input */
    public function adopt(array $input, User $actor): void
    {
        abort_unless($this->authority->institutionAllows($actor, PermissionCode::CurriculumApprove), 403);

        $pathwayId = Curriculum::whereKey($input['curriculum_id'])->value('academic_pathway_id');
        if ($pathwayId === null) {
            $this->rejectCurriculum();
        }

        DB::transaction(function () use ($pathwayId, $input, $actor): void {
            // The operative row may not exist yet. Serialize both first and later decisions on the pathway.
            $pathway = AcademicPathway::lockForUpdate()->find($pathwayId);
            $version = Curriculum::lockForUpdate()->find($input['curriculum_id']);

            if ($pathway === null || $version === null
                || $version->academic_pathway_id !== $pathway->id
                || $version->status !== CurriculumStatus::Approved) {
                $this->rejectCurriculum();
            }

            $scope = [
                'academic_pathway_id' => $pathway->id,
                'academic_session_id' => $input['academic_session_id'],
                'entry_cohort_id' => $input['entry_cohort_id'],
            ];
            $evidence = [
                'curriculum_id' => $version->id,
                'approved_by' => $actor->id,
                'decision_reference' => $input['decision_reference'],
                'reason' => $input['reason'],
            ];

            $adoption = CurriculumAdoption::where($scope)->lockForUpdate()->first();
            if ($adoption !== null && $this->wasRecorded($scope, $evidence)) {
                return;
            }

            $decision = CurriculumAdoptionDecision::create($scope + $evidence + ['recorded_at' => now()]);
            $adoption ??= new CurriculumAdoption($scope);
            $adoption->active_decision_id = $decision->id;
            $adoption->save();
        }, attempts: 3);
    }

    /**
     * @param  array{academic_pathway_id: string, academic_session_id: string, entry_cohort_id: string}  $scope
     * @param  array{curriculum_id: string, approved_by: string, decision_reference: string, reason: string}  $evidence
     */
    private function wasRecorded(array $scope, array $evidence): bool
    {
        $candidates = CurriculumAdoptionDecision::where($scope)
            ->where('curriculum_id', $evidence['curriculum_id'])
            ->where('approved_by', $evidence['approved_by'])
            ->where('decision_reference', $evidence['decision_reference'])
            ->sharedLock()
            ->cursor();

        // Match the exact strings rather than trusting the database collation, including for superseded decisions.
        return $candidates->contains(fn (CurriculumAdoptionDecision $decision): bool => $decision->decision_reference === $evidence['decision_reference']
            && $decision->reason === $evidence['reason']);
    }

    private function rejectCurriculum(): never
    {
        throw ValidationException::withMessages(['curriculum_id' => 'Select an approved pathway curriculum version.']);
    }
}
