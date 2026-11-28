<?php

namespace App\Services\Academics;

use App\Models\CourseRevision;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\ProgrammeLevel;
use Brick\Math\BigDecimal;
use Brick\Math\Exception\NumberFormatException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

final class PathwayCurriculumAssignmentRules
{
    public function revision(Curriculum $curriculum, string $id): CourseRevision
    {
        $revision = CourseRevision::eligibleForDepartment($curriculum->academicPathway->specialization->department_id)
            ->find(strtolower($id));
        if ($revision === null) {
            throw ValidationException::withMessages([
                'course_revision_id' => 'Select an approved course revision from the pathway’s department.',
            ]);
        }

        return $revision;
    }

    public function level(Curriculum $curriculum, string $id): ProgrammeLevel
    {
        $level = ProgrammeLevel::where('academic_programme_id', $curriculum->academic_programme_id)->find(strtolower($id));
        if ($level === null) {
            throw ValidationException::withMessages(['programme_level_id' => 'Select a level from the pathway’s programme.']);
        }

        return $level;
    }

    /** @return Builder<CurriculumCourse> */
    public function editableEntries(Curriculum $version): Builder
    {
        return CurriculumCourse::where('curriculum_id', $version->id)
            ->where('academic_programme_id', $version->academic_programme_id)
            ->whereNotNull('course_revision_id');
    }

    /** @return Collection<string, CurriculumCourse> */
    public function complete(Curriculum $curriculum): Collection
    {
        $entries = CurriculumCourse::where('curriculum_id', $curriculum->id)->get()->keyBy('id');
        if ($entries->isEmpty()) {
            throw ValidationException::withMessages(['status' => 'Assign at least one course before review or approval.']);
        }

        $revisions = CourseRevision::eligibleForDepartment($curriculum->academicPathway->specialization->department_id)
            ->whereKey($entries->pluck('course_revision_id')->filter()->unique()->values()->all())
            ->get()->keyBy('id');
        $levelIds = ProgrammeLevel::where('academic_programme_id', $curriculum->academic_programme_id)
            ->whereKey($entries->pluck('programme_level_id')->filter()->unique()->values()->all())->pluck('id')->flip();
        foreach ($entries as $entry) {
            $revision = $revisions->get($entry->course_revision_id);
            if ($revision === null
                || $revision->course_id !== $entry->course_id
                || $entry->academic_programme_id !== $curriculum->academic_programme_id
                || ! $levelIds->has($entry->programme_level_id)
                || $entry->pathway_category === null
                || $entry->pathway_requirement_mode === null
                || ! $this->validCredits($entry)
                || $entry->semester_position < 1
                || $entry->semester_position > 99) {
                throw ValidationException::withMessages(['status' => 'Every assignment must have a valid approved revision, placement and requirements.']);
            }
        }

        return $entries;
    }

    private function validCredits(CurriculumCourse $entry): bool
    {
        try {
            $credits = BigDecimal::of((string) $entry->getRawOriginal('credits'))->strippedOfTrailingZeros();
        } catch (NumberFormatException) {
            return false;
        }

        return $credits->getScale() <= 8 && $credits->isPositive() && $credits->isLessThanOrEqualTo('9999');
    }
}
