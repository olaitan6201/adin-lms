<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

final class AcademicCoreCurriculumResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $data = $this->resource;
        $version = $data['version'];
        $entries = $data['entries']->keyBy('id');
        $courseOutcomes = $data['courseOutcomes']->keyBy('id');
        $programmeOutcomes = $data['programmeOutcomes']->keyBy('id');
        $courses = $entries->keyBy('course_id');

        return [
            'id' => $version->id,
            'name' => AcademicCoreResource::curriculumName($version),
            'framework_revision' => $version->framework_revision,
            'history' => $data['history'] === null ? null : AcademicCoreVersionHistoryResource::make([
                ...$data['history'],
                'entries' => $entries,
            ])->resolve($request),
            'status' => $version->status->value,
            'levels' => $data['levels']->map(fn ($row) => ['id' => $row->id, 'name' => "$row->label ($row->code)"])->all(),
            'revisions' => $data['revisions']->map(fn ($row) => [
                'id' => $row->id, 'name' => "$row->code · $row->title · revision $row->revision_number", 'course_id' => $row->course_id,
            ])->all(),
            'entries' => $entries->values()->map(fn ($row) => [
                'id' => $row->id,
                'course_id' => $row->course_id,
                'course_revision_id' => $row->course_revision_id,
                'programme_level_id' => $row->programme_level_id,
                'code' => $row->code,
                'title' => $row->title,
                'level' => $row->level,
                'credits' => (string) $row->credits,
                'semester_position' => (int) $row->semester_position,
                'category' => $row->pathway_category?->value,
                'requirement_mode' => $row->pathway_requirement_mode?->value,
            ])->all(),
            'choices' => $data['choices']->map(
                fn ($row) => $this->choice($row, $data['options']->get($row->id, collect()), $entries),
            )->all(),
            'courseOutcomes' => $courseOutcomes->values()->map(fn ($row) => [
                'id' => $row->id, 'name' => $entries[$row->curriculum_course_id]->code.' · '.$row->statement,
            ])->all(),
            'programmeOutcomes' => $programmeOutcomes->values()->map(fn ($row) => ['id' => $row->id, 'name' => $row->statement])->all(),
            'prerequisites' => $data['prerequisites']->map(fn ($row) => [
                'for' => $entries[$row->curriculum_course_id]->code,
                'requires' => $courses->get($row->required_course_id)?->code ?? $row->required_course_id,
            ])->all(),
            'mappings' => $data['mappings']->map(fn ($row) => [
                'course' => $courseOutcomes[$row->course_outcome_id]->statement,
                'programme' => $programmeOutcomes[$row->programme_outcome_id]->statement,
            ])->all(),
            'adoptions' => $data['adoptions']->map(fn ($row) => [
                'id' => $row->id,
                'version' => (int) $row->version,
                'session' => $row->session,
                'cohort' => $row->cohort,
                'decision_reference' => $row->decision_reference,
                'reason' => $row->reason,
                'active' => $row->operative_id !== null,
            ])->all(),
        ];
    }

    /** @return array{id: string, code: string, minimum_selections: int, maximum_selections: int, unresolvedOptions: int, options: list<string>} */
    private function choice(object $row, Collection $options, Collection $entries): array
    {
        return [
            'id' => $row->id,
            'code' => $row->code,
            'minimum_selections' => (int) $row->minimum_selections,
            'maximum_selections' => (int) $row->maximum_selections,
            'unresolvedOptions' => $options->reject(fn ($option) => $entries->has($option->curriculum_course_id))->count(),
            'options' => $options->map(
                fn ($option) => $entries->get($option->curriculum_course_id)?->code
                    ?? $option->code.' (retained, not a pathway assignment)',
            )->all(),
        ];
    }
}
