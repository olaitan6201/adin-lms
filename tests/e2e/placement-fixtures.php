<?php

use App\Enums\OfferingStatus;
use App\Enums\RoleCode;
use App\Models\AcademicSession;
use App\Models\CourseRevision;
use App\Models\CurriculumAdoption;
use App\Models\CurriculumAdoptionDecision;
use App\Models\CurriculumCourse;
use App\Models\EntryCohort;
use App\Models\Offering;
use App\Models\ProgrammeLevel;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use App\Services\Academics\PlacementCsv;
use App\Services\Authority\ChangeRoleGrant;
use App\Services\Roster\ImportRosterFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

function seedPlacementFixture(string $run, string $project): void
{
    placementFixtureAccount($run, "registrar-$project", RoleCode::Registrar);
    placementFixtureAccount($run, "registrar-expiry-$project", RoleCode::Registrar);
    placementFixtureAccount($run, "registrar-delivery-switch-$project", RoleCode::Registrar);
    placementFixtureAccount($run, "structure-switch-$project", RoleCode::InstitutionalAdmin);

    $session = AcademicSession::factory()->create([
        'starts_on' => today()->subMonth(),
        'ends_on' => today()->addMonth(),
    ]);
    $adoption = CurriculumAdoption::factory()->create([
        'active_decision_id' => CurriculumAdoptionDecision::factory()->for($session, 'academicSession'),
    ]);
    $pin = $adoption->activeDecision;
    $transferCohort = EntryCohort::factory()->create();
    $transferDecision = CurriculumAdoptionDecision::factory()->create([
        'academic_session_id' => $session->id,
        'entry_cohort_id' => $transferCohort->id,
        'curriculum_id' => $pin->curriculum_id,
        'academic_pathway_id' => $pin->academic_pathway_id,
    ]);
    CurriculumAdoption::factory()->create(['active_decision_id' => $transferDecision->id]);
    $level = ProgrammeLevel::factory()->for($pin->academicPathway->programme, 'programme')->create();
    $revision = CourseRevision::factory()->approved()->create(['title' => placementFixtureToken("APPROVED-COURSE-$project-", 180)]);
    $legacy = CurriculumCourse::factory()->create(['course_id' => $revision->course_id]);
    $assignment = CurriculumCourse::factory()->create([
        'curriculum_id' => $pin->curriculum_id,
        'course_id' => $revision->course_id,
        'course_revision_id' => $revision->id,
        'academic_programme_id' => $level->academic_programme_id,
        'programme_level_id' => $level->id,
        'category' => 'core',
        'requirement_mode' => 'individual',
    ]);
    $term = Semester::factory()->for($pin->academicSession, 'session')->create();
    $offeringFields = [
        'curriculum_course_id' => $legacy->id,
        'semester_id' => $term->id,
        'section' => 'A',
        'delivery_mode' => 'online',
        'status' => OfferingStatus::Published,
        'approved_at' => now(),
        'approved_by' => $pin->approved_by,
    ];
    $offering = Offering::factory()->create([
        'external_offering_id' => placementFixtureToken("PLACEMENT-$project-", 128),
    ] + $offeringFields);
    Offering::factory()->create([
        'external_offering_id' => "NO-MATCH-$project",
        'curriculum_course_id' => CurriculumCourse::factory(),
        'section' => 'B',
    ] + $offeringFields);
    $blocked = Offering::factory()->create([
        'external_offering_id' => "BLOCKED-$project",
        'taught_course_revision_id' => $revision->id,
        'section' => 'C',
    ] + $offeringFields);
    // Recreate a legacy database row that predates validation of attestation evidence.
    DB::table('offering_curriculum_courses')->insert([
        'id' => (string) Str::uuid7(),
        'offering_id' => $blocked->id,
        'curriculum_course_id' => $assignment->id,
        'linked_by' => $pin->approved_by,
        'confirmation_note' => '   ',
        'confirmed_at' => now(),
    ]);
    if ($project === 'desktop') {
        for ($number = 1; $number <= 26; $number++) {
            Offering::factory()->create([
                'external_offering_id' => sprintf('ZZZ-PUBLISHED-%02d', $number),
                'section' => sprintf('P%02d', $number),
            ] + $offeringFields);
        }
    }

    $student = Student::factory()->create(['external_student_id' => placementFixtureToken("PRIVATE-STUDENT-$project-", 128)]);
    $roster = "$run/placement-roster-$project.csv";
    file_put_contents($roster, "student_id,offering_id,status,revision\n"
        ."$student->external_student_id,$offering->external_offering_id,registered,1\n", LOCK_EX);
    app(ImportRosterFile::class)->import($roster);
    foreach ([1, 2] as $number) {
        $row = [
            placementFixtureToken("REG-$project-", 128), $number, $student->external_student_id, $adoption->academic_pathway_id,
            $session->id, $number === 1 ? $adoption->entry_cohort_id : $transferCohort->id, $level->id,
            $number === 1 ? $session->starts_on->toDateString() : today()->addDay()->toDateString(),
        ];
        file_put_contents("$run/placement-$project-$number.csv", app(PlacementCsv::class)->template().implode(',', $row)."\r\n", LOCK_EX);
    }

    $batch = app(PlacementCsv::class)->template();
    for ($number = 1; $number <= 26; $number++) {
        $row = [
            sprintf('ZZZ-PLACEMENT-%s-%02d', $project, $number), 1, $student->external_student_id,
            $adoption->academic_pathway_id, $session->id, $adoption->entry_cohort_id, $level->id,
            $session->starts_on->toDateString(),
        ];
        $batch .= implode(',', $row)."\r\n";
    }

    file_put_contents("$run/placement-page-two-$project.csv", $batch, LOCK_EX);
}

function placementFixtureToken(string $prefix, int $length): string
{
    return str_pad($prefix, $length, 'X');
}

function placementFixtureAccount(string $run, string $login, RoleCode $role): void
{
    $user = User::factory()->create(['email' => "$login@demo.example.test"]);
    app(ChangeRoleGrant::class)->apply($user->id, $role, 'institution', false);
    file_put_contents("$run/$login.factor", enrollFixtureAuthenticator($user), LOCK_EX);
}
