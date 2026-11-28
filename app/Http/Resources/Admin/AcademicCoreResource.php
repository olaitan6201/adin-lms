<?php

namespace App\Http\Resources\Admin;

use App\Models\AcademicPathway;
use App\Models\Curriculum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class AcademicCoreResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = $this->resource;
        $course = $data['course'];
        $curriculum = $data['curriculum'];

        return [
            'edit' => $data['edit'],
            'approve' => $data['approve'],
            'links' => [
                'workspace' => route('admin.academic-core', absolute: false),
                'structure' => $data['structure'] ? route('admin.structure', absolute: false) : null,
                'legacyCatalogue' => route('academics.curriculum.show', absolute: false),
            ],
            'departments' => $data['departments']->map(fn ($row) => ['id' => $row->id, 'name' => "$row->name ($row->code)"]),
            'courses' => $data['courses']->map(fn ($row) => ['id' => $row->id, 'name' => $row->code]),
            'pathways' => $data['pathways']->map(fn (AcademicPathway $row) => ['id' => $row->id, 'name' => self::pathwayName($row)]),
            'sessions' => $data['sessions']->map(fn ($row) => ['id' => $row->id, 'name' => $row->label]),
            'cohorts' => $data['cohorts']->map(fn ($row) => ['id' => $row->id, 'name' => "$row->label ($row->code)"]),
            'course' => $course === null ? null : AcademicCoreCourseResource::make($course)->resolve($request),
            'curricula' => $data['curricula']->map(fn (Curriculum $row) => ['id' => $row->id, 'name' => self::curriculumName($row)]),
            'curriculum' => $curriculum === null ? null : AcademicCoreCurriculumResource::make($curriculum)->resolve($request),
            'actions' => AcademicCoreActionsResource::make(['course' => $course, 'curriculum' => $curriculum])->resolve($request),
        ];
    }

    public static function curriculumName(Curriculum $version): string
    {
        return self::pathwayName($version->academicPathway)." · v{$version->version}";
    }

    private static function pathwayName(AcademicPathway $pathway): string
    {
        $programme = $pathway->programme;
        $specialization = $pathway->specialization;

        return "$specialization->name ({$specialization->department->code}/$specialization->code) · $programme->name ($programme->code)";
    }
}
