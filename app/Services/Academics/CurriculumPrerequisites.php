<?php

namespace App\Services\Academics;

use App\Models\CurriculumCourse;
use App\Models\Prerequisite;
use Illuminate\Validation\ValidationException;

class CurriculumPrerequisites
{
    public function add(CurriculumCourse $entry, string $requiredId): void
    {
        $required = CurriculumCourse::where('curriculum_id', $entry->curriculum_id)->findOrFail($requiredId);
        $edges = Prerequisite::join(
            'curriculum_courses as entries',
            'entries.id',
            '=',
            'prerequisites.curriculum_course_id',
        )
            ->where('entries.curriculum_id', $entry->curriculum_id)
            ->get(['entries.course_id', 'required_course_id'])
            ->groupBy('course_id');
        $pending = [$required->course_id];
        $visited = [];
        while ($pending !== []) {
            $id = array_pop($pending);
            if ($id === $entry->course_id) {
                throw ValidationException::withMessages([
                    'required_entry_id' => 'This prerequisite creates a cycle.',
                ]);
            }

            if (! isset($visited[$id])) {
                $visited[$id] = true;
                array_push(
                    $pending,
                    ...$edges->get($id, collect())->pluck('required_course_id')->all(),
                );
            }
        }

        Prerequisite::unguarded(
            fn () => Prerequisite::firstOrCreate([
                'curriculum_course_id' => $entry->id,
                'required_course_id' => $required->course_id,
            ]),
        );
    }
}
