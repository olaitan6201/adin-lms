<?php

namespace App\Services\Academics;

use App\Enums\CurriculumStatus;
use App\Enums\PathwayCurriculumAuditAction;
use App\Models\CourseOutcome;
use App\Models\Curriculum;
use App\Models\User;
use Illuminate\Validation\ValidationException;

/** @phpstan-import-type AssignmentData from PathwayCurriculumAssignments */
final class PathwayCurriculumEditing
{
    public function __construct(
        private PathwayCurriculumMutation $mutation,
        private PathwayCurriculumAssignments $assignments,
        private PathwayCurriculumAssignmentRules $assignmentRules,
        private PathwayCurriculumChoices $choices,
        private CurriculumEditing $editing,
    ) {}

    /** @param AssignmentData $data */
    public function assignment(User $actor, string $id, array $data): Curriculum
    {
        return $this->mutation->apply($id, CurriculumStatus::Draft, $actor, PathwayCurriculumAuditAction::Assigned,
            fn (Curriculum $version): array => $this->assignments->add($version, $data));
    }

    /** @param AssignmentData $data */
    public function updateAssignment(User $actor, string $id, string $entryId, array $data): Curriculum
    {
        return $this->mutation->apply($id, CurriculumStatus::Draft, $actor, PathwayCurriculumAuditAction::AssignmentUpdated,
            fn (Curriculum $version): array => $this->assignments->update($version, $entryId, $data));
    }

    /** @param array{code: string, minimum_selections: int|string, maximum_selections: int|string, curriculum_course_ids: list<string>} $data */
    public function choice(User $actor, string $id, array $data): Curriculum
    {
        return $this->mutation->apply($id, CurriculumStatus::Draft, $actor, PathwayCurriculumAuditAction::ChoiceAdded,
            function (Curriculum $version) use ($data): array {
                $group = $this->choices->add($version, $data);

                return [
                    'group_id' => $group->id,
                    'code' => $group->code,
                    'minimum_selections' => $group->minimum_selections,
                    'maximum_selections' => $group->maximum_selections,
                    'curriculum_course_ids' => array_map(strtolower(...), $data['curriculum_course_ids']),
                ];
            });
    }

    /** @param array<string, string> $data */
    public function graph(User $actor, string $id, PathwayCurriculumAuditAction $action, array $data): Curriculum
    {
        $operation = match ($action) {
            PathwayCurriculumAuditAction::PrerequisiteAdded => 'prerequisite',
            PathwayCurriculumAuditAction::CourseOutcomeAdded => 'course-outcome',
            PathwayCurriculumAuditAction::ProgrammeOutcomeAdded => 'programme-outcome',
            PathwayCurriculumAuditAction::OutcomeMapped => 'mapping',
        };

        foreach (['entry_id', 'required_entry_id', 'course_outcome_id', 'programme_outcome_id'] as $key) {
            if (isset($data[$key])) {
                $data[$key] = strtolower($data[$key]);
            }
        }

        return $this->mutation->apply($id, CurriculumStatus::Draft, $actor, $action,
            function (Curriculum $version) use ($operation, $data): ?array {
                $this->requirePathwayEntries($version, $data);

                return $this->editing->apply($version, $operation, $data) ? $data : null;
            });
    }

    /** @param array<string, string> $data */
    private function requirePathwayEntries(Curriculum $version, array $data): void
    {
        $entries = $this->assignmentRules->editableEntries($version);
        foreach (['entry_id', 'required_entry_id'] as $key) {
            if (isset($data[$key])) {
                (clone $entries)->findOrFail($data[$key], ['id']);
            }
        }

        if (isset($data['course_outcome_id']) && ! CourseOutcome::whereKey($data['course_outcome_id'])
            ->whereIn('curriculum_course_id', $entries->select('id'))->exists()) {
            throw ValidationException::withMessages(['mapping' => 'Both outcomes must belong to this version.']);
        }
    }
}
