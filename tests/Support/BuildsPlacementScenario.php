<?php

namespace Tests\Support;

use App\Enums\EnrolmentStatus;
use App\Enums\OfferingStatus;
use App\Models\CourseRevision;
use App\Models\CurriculumAdoption;
use App\Models\CurriculumAdoptionDecision;
use App\Models\CurriculumCourse;
use App\Models\Offering;
use App\Models\ProgrammeLevel;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use App\Services\Academics\PlacementCsvRow;
use App\Services\Roster\ImportRosterFile;
use Illuminate\Http\UploadedFile;

trait BuildsPlacementScenario
{
    private function placementRow(
        Student $student,
        CurriculumAdoptionDecision $pin,
        string $registration = 'SCHOOL-0001',
        int $number = 1,
        ?string $effectiveOn = null,
    ): PlacementCsvRow {
        $level = ProgrammeLevel::factory()->for($pin->academicPathway->programme, 'programme')->create();

        return new PlacementCsvRow(
            $registration,
            $number,
            $student->external_student_id,
            $pin->academic_pathway_id,
            $pin->academic_session_id,
            $pin->entry_cohort_id,
            $level->id,
            $effectiveOn ?? $pin->academicSession->starts_on->toDateString(),
        );
    }

    private function transferPin(PlacementCsvRow $row, ?string $sessionId = null): CurriculumAdoptionDecision
    {
        $destination = CurriculumAdoptionDecision::factory()->create([
            'academic_session_id' => $sessionId ?? $row->sessionId,
            'entry_cohort_id' => $row->cohortId,
        ]);
        CurriculumAdoption::factory()->for($destination, 'activeDecision')->create();

        return $destination;
    }

    private function approvedAssignment(CurriculumAdoptionDecision $pin, ?string $levelId = null): CurriculumCourse
    {
        $levelId ??= ProgrammeLevel::factory()->for($pin->academicPathway->programme, 'programme')->create()->id;
        $revision = CourseRevision::factory()->approved()->create();

        return CurriculumCourse::factory()->create([
            'curriculum_id' => $pin->curriculum_id,
            'course_id' => $revision->course_id,
            'course_revision_id' => $revision->id,
            'academic_programme_id' => $pin->academicPathway->academic_programme_id,
            'programme_level_id' => $levelId,
            'category' => 'core',
            'requirement_mode' => 'individual',
        ]);
    }

    /** @param array<string, mixed> $attributes */
    private function publishedOffering(
        User $actor,
        CurriculumAdoptionDecision $pin,
        CurriculumCourse $assignment,
        array $attributes = [],
    ): Offering {
        $legacy = CurriculumCourse::factory()->create(['course_id' => $assignment->course_id]);
        $attributes['semester_id'] ??= Semester::factory()->for($pin->academicSession, 'session')->create()->id;

        return Offering::factory()->create($attributes + [
            'curriculum_course_id' => $legacy->id,
            'section' => 'A',
            'delivery_mode' => 'online',
            'status' => OfferingStatus::Published,
            'approved_at' => now(),
            'approved_by' => $actor->id,
        ]);
    }

    private function importRegistration(
        Student $student,
        Offering $offering,
        int $revision = 1,
        EnrolmentStatus $status = EnrolmentStatus::Registered,
    ): int {
        $roster = UploadedFile::fake()->createWithContent(
            'roster.csv',
            "student_id,offering_id,status,revision\n"
            ."$student->external_student_id,$offering->external_offering_id,{$status->value},$revision\n",
        );

        return app(ImportRosterFile::class)->import($roster->getPathname());
    }
}
