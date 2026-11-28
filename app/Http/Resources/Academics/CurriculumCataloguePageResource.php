<?php

namespace App\Http\Resources\Academics;

use App\Models\AcademicLevel;
use App\Models\CourseOutcome;
use App\Models\CurriculumCourse;
use App\Models\OutcomeMapping;
use App\Models\Prerequisite;
use App\Models\Programme;
use App\Models\ProgrammeOutcome;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class CurriculumCataloguePageResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $page = $this->resource;
        $version = $page['version'];

        return [
            'edit' => $page['edit'],
            'approve' => $page['approve'],
            'entries' => $page['entries']->map($this->entry(...))->all(),
            'courseOutcomes' => $page['courseOutcomes']->map(fn (CourseOutcome $outcome): array => [
                'id' => $outcome->id,
                'curriculum_course_id' => $outcome->curriculum_course_id,
                'statement' => $outcome->statement,
            ])->all(),
            'programmeOutcomes' => $page['programmeOutcomes']->map(fn (ProgrammeOutcome $outcome): array => [
                'id' => $outcome->id,
                'curriculum_id' => $outcome->curriculum_id,
                'statement' => $outcome->statement,
            ])->all(),
            'version' => $version === null
                ? null
                : CurriculumCatalogueSelectionResource::make($version)->resolve($request),
            'academicCoreUrl' => $version?->academic_pathway_id === null
                ? null
                : route('admin.academic-core', ['curriculum' => $version->id], false),
            'approverName' => $page['approverName'],
            'mappings' => $page['mappings']->map(fn (OutcomeMapping $mapping): array => [
                'id' => $mapping->id,
                'course_outcome_id' => $mapping->course_outcome_id,
                'programme_outcome_id' => $mapping->programme_outcome_id,
            ])->all(),
            'prerequisites' => $page['prerequisites']->map(fn (Prerequisite $prerequisite): array => [
                'id' => $prerequisite->id,
                'curriculum_course_id' => $prerequisite->curriculum_course_id,
                'required_course_id' => $prerequisite->required_course_id,
            ])->all(),
            'programmes' => $page['programmes']->map(fn (Programme $programme): array => [
                'id' => $programme->id,
                'name' => $programme->name,
            ])->all(),
            'versions' => CurriculumCatalogueListingResource::make($page['versions'])->resolve($request),
            'levels' => $page['levels']->map(fn (AcademicLevel $level): array => [
                'id' => $level->id,
                'name' => $level->label,
            ])->all(),
        ];
    }

    /**
     * Keep the legacy database-native wire values for credits and compulsory.
     *
     * @return array<string, mixed>
     */
    private function entry(CurriculumCourse $entry): array
    {
        return [
            'id' => $entry->id,
            'curriculum_id' => $entry->curriculum_id,
            'course_id' => $entry->course_id,
            'title' => $entry->title,
            'description' => $entry->description,
            'outline' => $entry->outline,
            'credits' => $entry->getRawOriginal('credits'),
            'level_id' => $entry->level_id,
            'semester_position' => $entry->semester_position,
            'compulsory' => $entry->getRawOriginal('compulsory'),
            'course_revision_id' => $entry->course_revision_id,
            'academic_programme_id' => $entry->academic_programme_id,
            'programme_level_id' => $entry->programme_level_id,
            'category' => $entry->category,
            'requirement_mode' => $entry->requirement_mode,
            'code' => $entry->code,
        ];
    }
}
