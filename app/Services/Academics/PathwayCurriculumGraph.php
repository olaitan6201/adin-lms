<?php

namespace App\Services\Academics;

use App\Models\CourseOutcome;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\OutcomeMapping;
use App\Models\Prerequisite;
use App\Models\ProgrammeOutcome;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

final class PathwayCurriculumGraph
{
    /** @param Collection<string, CurriculumCourse> $entries */
    public function validate(Curriculum $version, Collection $entries): void
    {
        $this->validatePrerequisites($entries);
        $this->validateOutcomeMappings($version, $entries);
    }

    /** @param Collection<string, CurriculumCourse> $entries */
    private function validatePrerequisites(Collection $entries): void
    {
        $courses = $entries->pluck('course_id')->all();
        $incoming = array_fill_keys($courses, 0);
        $dependants = [];

        foreach (Prerequisite::whereIn('curriculum_course_id', $entries->modelKeys())->get() as $edge) {
            $required = $edge->required_course_id;
            $course = $entries->get($edge->curriculum_course_id)->course_id;
            if (! isset($incoming[$required])) {
                throw ValidationException::withMessages(['status' => 'Prerequisites must point to courses assigned to this curriculum.']);
            }

            $dependants[$required][] = $course;
            $incoming[$course]++;
        }

        $ready = array_keys($incoming, 0, true);
        $visited = 0;
        while ($ready !== []) {
            $course = array_pop($ready);
            $visited++;
            foreach ($dependants[$course] ?? [] as $dependant) {
                $incoming[$dependant]--;
                if ($incoming[$dependant] === 0) {
                    $ready[] = $dependant;
                }
            }
        }

        if ($visited !== count($courses)) {
            throw ValidationException::withMessages(['status' => 'Curriculum prerequisites must not contain cycles.']);
        }
    }

    /** @param Collection<string, CurriculumCourse> $entries */
    private function validateOutcomeMappings(Curriculum $version, Collection $entries): void
    {
        $courseOutcomes = CourseOutcome::whereIn('curriculum_course_id', $entries->modelKeys())->pluck('id');
        $programmeOutcomes = ProgrammeOutcome::where('curriculum_id', $version->id)->pluck('id');

        $outsideProgramme = OutcomeMapping::whereIn('course_outcome_id', $courseOutcomes)
            ->whereNotIn('programme_outcome_id', $programmeOutcomes)->exists();
        $outsideCourse = OutcomeMapping::whereIn('programme_outcome_id', $programmeOutcomes)
            ->whereNotIn('course_outcome_id', $courseOutcomes)->exists();
        if ($outsideProgramme || $outsideCourse) {
            throw ValidationException::withMessages(['status' => 'Both ends of every outcome mapping must belong to this curriculum.']);
        }
    }
}
