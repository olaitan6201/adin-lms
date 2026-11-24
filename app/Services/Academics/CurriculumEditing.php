<?php

namespace App\Services\Academics;

use App\Models\Course;
use App\Models\CourseOutcome;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\OutcomeMapping;
use App\Models\Prerequisite;
use App\Models\ProgrammeOutcome;
use Illuminate\Validation\ValidationException;

class CurriculumEditing
{
    public function apply(Curriculum $version, string $action, array $data): void
    {
        $entries = CurriculumCourse::where('curriculum_id', $version->id);
        $entry = isset($data['entry_id']) ? (clone $entries)->findOrFail($data['entry_id']) : null;
        switch ($action) {
            case 'entry':
                $course = Course::unguarded(fn () => Course::firstOrCreate(['code' => $data['code']], ['department_id' => $version->programme->department_id]));
                unset($data['code']);
                CurriculumCourse::unguarded(fn () => CurriculumCourse::updateOrCreate(['course_id' => $course->id, 'curriculum_id' => $version->id], $data));
                break;
            case 'course-outcome':
                CourseOutcome::forceCreate(['curriculum_course_id' => $entry->id, 'statement' => $data['statement']]);
                break;
            case 'programme-outcome':
                ProgrammeOutcome::forceCreate(['curriculum_id' => $version->id, 'statement' => $data['statement']]);
                break;
            case 'mapping':
                $valid = CourseOutcome::whereIn('curriculum_course_id', $entries->select('id'))->whereKey($data['course_outcome_id'])->exists()
                    && ProgrammeOutcome::where('curriculum_id', $version->id)->whereKey($data['programme_outcome_id'])->exists();
                if (! $valid) {
                    throw ValidationException::withMessages(['mapping' => 'Both outcomes must belong to this version.']);
                }
                OutcomeMapping::unguarded(fn () => OutcomeMapping::firstOrCreate($data));
                break;
            case 'prerequisite':
                $required = $entries->findOrFail($data['required_entry_id']);
                $edges = Prerequisite::join('curriculum_courses as entries', 'entries.id', '=', 'prerequisites.curriculum_course_id')
                    ->where('entries.curriculum_id', $version->id)->get(['entries.course_id', 'required_course_id'])->groupBy('course_id');
                $pending = [$required->course_id];
                $visited = [];
                while ($pending !== []) {
                    $id = array_pop($pending);
                    if ($id === $entry->course_id) {
                        throw ValidationException::withMessages(['required_entry_id' => 'This prerequisite creates a cycle.']);
                    }
                    if (! isset($visited[$id])) {
                        $visited[$id] = true;
                        array_push($pending, ...$edges->get($id, collect())->pluck('required_course_id')->all());
                    }
                }
                Prerequisite::unguarded(fn () => Prerequisite::firstOrCreate(['curriculum_course_id' => $entry->id, 'required_course_id' => $required->course_id]));
                break;
        }
    }
}
