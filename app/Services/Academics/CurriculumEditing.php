<?php

namespace App\Services\Academics;

use App\Models\Course;
use App\Models\CourseOutcome;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\OutcomeMapping;
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
                $course = Course::unguarded(
                    fn () => Course::firstOrCreate(
                        ['code' => $data['code']],
                        ['department_id' => $version->programme->department_id],
                    ),
                );
                unset($data['code']);
                CurriculumCourse::unguarded(
                    fn () => CurriculumCourse::updateOrCreate(
                        ['course_id' => $course->id, 'curriculum_id' => $version->id],
                        $data,
                    ),
                );
                break;
            case 'course-outcome':
                CourseOutcome::forceCreate([
                    'curriculum_course_id' => $entry->id,
                    'statement' => $data['statement'],
                ]);
                break;
            case 'programme-outcome':
                ProgrammeOutcome::forceCreate([
                    'curriculum_id' => $version->id,
                    'statement' => $data['statement'],
                ]);
                break;
            case 'mapping':
                $valid =
                    CourseOutcome::whereIn('curriculum_course_id', $entries->select('id'))
                        ->whereKey($data['course_outcome_id'])
                        ->exists() &&
                    ProgrammeOutcome::where('curriculum_id', $version->id)
                        ->whereKey($data['programme_outcome_id'])
                        ->exists();
                if (! $valid) {
                    throw ValidationException::withMessages([
                        'mapping' => 'Both outcomes must belong to this version.',
                    ]);
                }

                OutcomeMapping::unguarded(fn () => OutcomeMapping::firstOrCreate($data));
                break;
            case 'unmap':
                OutcomeMapping::whereIn('course_outcome_id', CourseOutcome::whereIn(
                    'curriculum_course_id', $entries->select('id'),
                )->select('id'))->findOrFail($data['mapping_id'])->delete();
                break;
            case 'prerequisite':
                app(CurriculumPrerequisites::class)->add($entry, $data['required_entry_id']);
                break;
        }
    }
}
