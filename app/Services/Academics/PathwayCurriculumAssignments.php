<?php

namespace App\Services\Academics;

use App\Enums\CurriculumCourseCategory;
use App\Enums\CurriculumRequirementMode;
use App\Models\CourseRevision;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use Brick\Math\BigDecimal;
use Illuminate\Validation\ValidationException;

/**
 * @phpstan-type AssignmentData array{course_revision_id: string, programme_level_id: string, category: string, requirement_mode: string, credits: string, semester_position: int|string}
 * @phpstan-type AssignmentState array{course_revision_id: string, programme_level_id: string, category: ?string, requirement_mode: ?string, credits: string, semester_position: int}
 */
final class PathwayCurriculumAssignments
{
    public function __construct(private PathwayCurriculumAssignmentRules $rules) {}

    /**
     * @param  AssignmentData  $data
     * @return array{curriculum_course_id: string}&AssignmentState
     */
    public function add(Curriculum $curriculum, array $data): array
    {
        $revision = $this->rules->revision($curriculum, $data['course_revision_id']);
        if (CurriculumCourse::where('curriculum_id', $curriculum->id)->where('course_id', $revision->course_id)->exists()) {
            throw ValidationException::withMessages(['course_revision_id' => 'This course is already assigned to the curriculum.']);
        }

        $entry = new CurriculumCourse;
        $entry->forceFill([
            'curriculum_id' => $curriculum->id,
            'course_id' => $revision->course_id,
            'academic_programme_id' => $curriculum->academic_programme_id,
            'requirement_mode' => CurriculumRequirementMode::from($data['requirement_mode']),
        ]);
        $this->persist($curriculum, $entry, $revision, $data);

        return ['curriculum_course_id' => $entry->id] + $this->snapshot($entry);
    }

    /**
     * @param  AssignmentData  $data
     * @return array{curriculum_course_id: string, before: AssignmentState, after: AssignmentState}
     */
    public function update(Curriculum $curriculum, string $id, array $data): array
    {
        $entry = $this->rules->editableEntries($curriculum)->findOrFail(strtolower($id));
        $revision = $this->rules->revision($curriculum, $data['course_revision_id']);
        if ($revision->course_id !== $entry->course_id) {
            throw ValidationException::withMessages(['course_revision_id' => 'Select a revision of the assigned course.']);
        }

        if ($entry->pathway_requirement_mode !== CurriculumRequirementMode::from($data['requirement_mode'])) {
            throw ValidationException::withMessages(['requirement_mode' => 'An existing assignment must keep its requirement mode.']);
        }

        $before = $this->snapshot($entry);
        $this->persist($curriculum, $entry, $revision, $data);

        return ['curriculum_course_id' => $entry->id, 'before' => $before, 'after' => $this->snapshot($entry)];
    }

    /** @param AssignmentData $data */
    private function persist(Curriculum $curriculum, CurriculumCourse $entry, CourseRevision $revision, array $data): void
    {
        $level = $this->rules->level($curriculum, $data['programme_level_id']);
        $credits = $data['credits'];
        $entry->forceFill([
            'course_revision_id' => $revision->id,
            'programme_level_id' => $level->id,
            'category' => CurriculumCourseCategory::from($data['category']),
            'credits' => $credits,
            'semester_position' => (int) $data['semester_position'],
        ])->save();

        if ($entry->getConnection()->getDriverName() === 'sqlite'
            && ! BigDecimal::of((string) $entry->refresh()->getRawOriginal('credits'))->isEqualTo($credits)) {
            throw ValidationException::withMessages(['credits' => 'This database cannot store these credits exactly.']);
        }
    }

    /** @return AssignmentState */
    private function snapshot(CurriculumCourse $entry): array
    {
        return [
            'course_revision_id' => $entry->course_revision_id,
            'programme_level_id' => $entry->programme_level_id,
            'category' => $entry->pathway_category?->value,
            'requirement_mode' => $entry->pathway_requirement_mode?->value,
            'credits' => (string) BigDecimal::of((string) $entry->credits)->strippedOfTrailingZeros(),
            'semester_position' => (int) $entry->semester_position,
        ];
    }
}
