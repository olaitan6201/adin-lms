<?php

namespace App\Services\Academics;

use App\Models\CourseOutcome;
use App\Models\Curriculum;
use App\Models\CurriculumChoiceGroup;
use App\Models\CurriculumCourse;
use App\Models\OutcomeMapping;
use App\Models\Prerequisite;
use App\Models\ProgrammeOutcome;

final class PathwayCurriculumFork
{
    public function copy(Curriculum $source, Curriculum $draft): void
    {
        $entries = $this->copyAssignments($source, $draft);
        $this->copyChoices($source, $draft, $entries);
        $this->copyPrerequisites($entries);
        $this->copyOutcomes($source, $draft, $entries);
    }

    /** @return array<string, string> */
    private function copyAssignments(Curriculum $source, Curriculum $draft): array
    {
        $entries = [];
        foreach (CurriculumCourse::where('curriculum_id', $source->id)->get() as $entry) {
            $copy = $entry->replicate()->forceFill(['curriculum_id' => $draft->id]);
            $copy->save();
            $entries[$entry->id] = $copy->id;
        }

        return $entries;
    }

    /** @param array<string, string> $entries */
    private function copyChoices(Curriculum $source, Curriculum $draft, array $entries): void
    {
        foreach (CurriculumChoiceGroup::with('options')->where('curriculum_id', $source->id)->get() as $group) {
            $copy = $group->replicate()->fill(['curriculum_id' => $draft->id]);
            $copy->save();
            foreach ($group->options as $option) {
                $copy->options()->create([
                    'curriculum_id' => $draft->id,
                    'curriculum_course_id' => $entries[$option->curriculum_course_id],
                ]);
            }
        }
    }

    /** @param array<string, string> $entries */
    private function copyPrerequisites(array $entries): void
    {
        foreach (Prerequisite::whereIn('curriculum_course_id', array_keys($entries))->get() as $edge) {
            // The prerequisite target is a stable course identity, not a curriculum assignment ID.
            $edge->replicate()->forceFill(['curriculum_course_id' => $entries[$edge->curriculum_course_id]])->save();
        }
    }

    /** @param array<string, string> $entries */
    private function copyOutcomes(Curriculum $source, Curriculum $draft, array $entries): void
    {
        $programmeOutcomes = [];
        foreach (ProgrammeOutcome::where('curriculum_id', $source->id)->get() as $outcome) {
            $copy = $outcome->replicate()->forceFill(['curriculum_id' => $draft->id]);
            $copy->save();
            $programmeOutcomes[$outcome->id] = $copy->id;
        }

        $courseOutcomes = [];
        foreach (CourseOutcome::whereIn('curriculum_course_id', array_keys($entries))->get() as $outcome) {
            $copy = $outcome->replicate()->forceFill(['curriculum_course_id' => $entries[$outcome->curriculum_course_id]]);
            $copy->save();
            $courseOutcomes[$outcome->id] = $copy->id;
        }

        foreach (OutcomeMapping::whereIn('course_outcome_id', array_keys($courseOutcomes))->get() as $mapping) {
            $mapping->replicate()->forceFill([
                'course_outcome_id' => $courseOutcomes[$mapping->course_outcome_id],
                'programme_outcome_id' => $programmeOutcomes[$mapping->programme_outcome_id],
            ])->save();
        }
    }
}
