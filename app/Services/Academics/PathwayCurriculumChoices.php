<?php

namespace App\Services\Academics;

use App\Enums\CurriculumRequirementMode;
use App\Models\Curriculum;
use App\Models\CurriculumChoiceGroup;
use App\Models\CurriculumChoiceOption;
use App\Models\CurriculumCourse;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

final class PathwayCurriculumChoices
{
    /** @param array{code: string, minimum_selections: int|string, maximum_selections: int|string, curriculum_course_ids: list<string>} $data */
    public function add(Curriculum $curriculum, array $data): CurriculumChoiceGroup
    {
        $ids = array_map(strtolower(...), $data['curriculum_course_ids']);
        $entries = CurriculumCourse::where('curriculum_id', $curriculum->id)->whereKey($ids)->get();
        if ($entries->count() !== count($ids) || ! $this->eligibleOptions($entries)) {
            throw ValidationException::withMessages([
                'curriculum_course_ids' => 'Use choice assignments from this version, at the same level and semester.',
            ]);
        }

        if (! $this->withinBounds((int) $data['minimum_selections'], (int) $data['maximum_selections'], count($ids))) {
            throw ValidationException::withMessages(['maximum_selections' => 'Selection bounds must fit the number of options.']);
        }

        if (CurriculumChoiceOption::whereIn('curriculum_course_id', $ids)->exists()) {
            throw ValidationException::withMessages(['curriculum_course_ids' => 'A choice assignment can belong to only one group.']);
        }

        if (CurriculumChoiceGroup::where('curriculum_id', $curriculum->id)->where('code', $data['code'])->exists()) {
            throw ValidationException::withMessages(['code' => 'This choice code is already in use in this version.']);
        }

        $group = CurriculumChoiceGroup::create([
            'curriculum_id' => $curriculum->id,
            'code' => $data['code'],
            'minimum_selections' => $data['minimum_selections'],
            'maximum_selections' => $data['maximum_selections'],
        ]);

        foreach ($ids as $id) {
            $group->options()->create([
                'curriculum_id' => $curriculum->id,
                'curriculum_course_id' => $id,
            ]);
        }

        return $group;
    }

    /** @param Collection<string, CurriculumCourse> $entries */
    public function validate(Curriculum $curriculum, Collection $entries): void
    {
        $assigned = [];
        foreach (CurriculumChoiceGroup::with('options')->where('curriculum_id', $curriculum->id)->get() as $group) {
            $options = new Collection;
            foreach ($group->options as $option) {
                $id = $option->curriculum_course_id;
                if ($option->curriculum_id !== $curriculum->id || ! $entries->has($id) || isset($assigned[$id])) {
                    throw ValidationException::withMessages(['status' => 'Choice options must belong to this version and only one group.']);
                }

                $assigned[$id] = true;
                $options->push($entries->get($id));
            }

            if (! $this->withinBounds($group->minimum_selections, $group->maximum_selections, $options->count())
                || ! $this->eligibleOptions($options)) {
                throw ValidationException::withMessages(['status' => 'Every choice group must have valid bounds and eligible options.']);
            }
        }

        foreach ($entries as $entry) {
            if ($entry->pathway_requirement_mode === CurriculumRequirementMode::Choice && ! isset($assigned[$entry->id])) {
                throw ValidationException::withMessages(['status' => 'Every choice assignment must belong to exactly one group.']);
            }
        }
    }

    private function withinBounds(int $minimum, int $maximum, int $count): bool
    {
        return $minimum >= 0 && $maximum >= max($minimum, 1) && $maximum <= $count;
    }

    /** @param Collection<int, CurriculumCourse> $entries */
    private function eligibleOptions(Collection $entries): bool
    {
        $first = $entries->first();

        return $entries->every(fn (CurriculumCourse $entry): bool => $entry->pathway_requirement_mode === CurriculumRequirementMode::Choice
            && $entry->compulsory !== true
            && $entry->programme_level_id === $first->programme_level_id
            && $entry->semester_position === $first->semester_position);
    }
}
