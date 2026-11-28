<?php

namespace Tests\Support;

use App\Enums\CurriculumStatus;
use App\Models\AcademicPathway;
use App\Models\Course;
use App\Models\Curriculum;
use App\Models\CurriculumCourse;
use App\Models\ProgrammeLevel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

trait BuildsCoreCompatibilityGraph
{
    private function pathwayVersion(CurriculumStatus $status, ?string $legacyProgrammeId = null): Curriculum
    {
        $pathway = AcademicPathway::factory()->create();

        return Curriculum::factory()->create([
            'programme_id' => $legacyProgrammeId,
            'academic_pathway_id' => $pathway->id,
            'academic_programme_id' => $pathway->academic_programme_id,
            'version' => 2,
            'status' => $status,
        ]);
    }

    private function fullAssignment(Curriculum $version, bool $retainLegacyFields = false): CurriculumCourse
    {
        $level = ProgrammeLevel::factory()->create(['academic_programme_id' => $version->academic_programme_id]);
        $course = Course::factory()->create();
        $revisionId = (string) Str::uuid7();
        DB::table('course_revisions')->insert([
            'id' => $revisionId,
            'course_id' => $course->id,
            'revision_number' => 1,
            'title' => 'Revision title',
            'description' => 'Revision description',
            'standard_units' => '3.12500000',
        ]);
        $legacy = $retainLegacyFields ? [] : ['title' => null, 'description' => null, 'level_id' => null, 'compulsory' => null];

        return CurriculumCourse::factory()->create([
            'curriculum_id' => $version->id,
            'course_id' => $course->id,
            'course_revision_id' => $revisionId,
            'academic_programme_id' => $version->academic_programme_id,
            'programme_level_id' => $level->id,
            'category' => 'core',
            'requirement_mode' => 'individual',
            'credits' => '3.12500000',
        ] + $legacy);
    }
}
