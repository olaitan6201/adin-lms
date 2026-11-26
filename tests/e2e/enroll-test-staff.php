<?php

use App\Enums\RoleCode;
use App\Models\CurriculumCourse;
use App\Models\Enrolment;
use App\Models\GuardianAccess;
use App\Models\Lecturer;
use App\Models\Offering;
use App\Models\Student;
use App\Models\TeachingAllocation;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use App\Services\Security\TotpEnrollment;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

// Fail the server bootstrap on fixture errors instead of serving a partially seeded database.
set_exception_handler(static function (Throwable $error): never {
    fwrite(STDERR, $error->getMessage().PHP_EOL);
    exit(1);
});

$run = realpath((string) getenv('PORTAL_E2E_RUN'));
$sandbox = realpath(base_path('.agent-work/browser-tests'));
if (! $run || ! $sandbox || ! str_starts_with($run, $sandbox.'/run-')
    || ! $app->environment('testing') || DB::getDriverName() !== 'sqlite'
    || realpath(DB::connection()->getDatabaseName()) !== $run.'/portal.sqlite') {
    throw new LogicException('This fixture requires a disposable browser test database.');
}

require __DIR__.'/workspace-fixtures.php';

umask(0077);
$offering = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->sole();
$authors = ['group-desktop', 'group-phone', 'lesson-desktop', 'lesson-phone'];
foreach (['desktop', 'phone'] as $project) {
    seedWorkspaceFixtures($offering, $project, $run);
    $qa = User::factory()->create(['email' => "quality-desk-{$project}@demo.example.test"]);
    app(ChangeRoleGrant::class)->apply($qa->id, RoleCode::QualityAssuranceOfficer, 'institution', false);
    file_put_contents($run."/quality-desk-{$project}.factor", app(TotpEnrollment::class)->issue($qa), LOCK_EX);
    $exchange = 'exchange-'.$project;
    $reader = User::factory()->create(['email' => "$exchange-reader@demo.example.test"]);
    Student::factory()->create(['user_id' => $reader->id]);
    $author = User::factory()->create(['email' => $exchange.'@demo.example.test']);
    $delivery = $offering->only(['semester_id', 'section', 'delivery_mode', 'approved_by', 'approved_at']);
    $source = Offering::factory()->create($delivery + ['curriculum_course_id' => CurriculumCourse::factory(), 'status' => 'published']);
    $target = Offering::factory()->create($delivery + ['curriculum_course_id' => CurriculumCourse::factory()]);
    $lecturer = Lecturer::factory()->create(['user_id' => $author->id]);
    TeachingAllocation::factory()->create(['lecturer_id' => $lecturer->id, 'offering_id' => $source->id]);
    app(ChangeRoleGrant::class)->apply($author->id, RoleCode::InstitutionalAdmin, 'institution', false);
    $factor = app(TotpEnrollment::class)->issue($author);
    file_put_contents("$run/$exchange.json", json_encode(['source' => $source->id, 'target' => $target->id, 'factor' => $factor], JSON_THROW_ON_ERROR), LOCK_EX);

    $guardian = User::factory()->create(['email' => "guardian-{$project}@demo.example.test"]);
    app(ChangeRoleGrant::class)->apply($guardian->id, RoleCode::Guardian, 'institution', false);
    $operator = User::factory()->create(['email' => "privacy-{$project}@demo.example.test"]);
    app(ChangeRoleGrant::class)->apply($operator->id, RoleCode::SuperAdmin, 'institution', false);
    file_put_contents($run."/privacy-{$project}.factor", app(TotpEnrollment::class)->issue($operator), LOCK_EX);
    $executor = User::factory()->create(['email' => "privacy-executor-{$project}@demo.example.test"]);
    app(ChangeRoleGrant::class)->apply($executor->id, RoleCode::SuperAdmin, 'institution', false);
    file_put_contents($run."/privacy-executor-{$project}.factor", app(TotpEnrollment::class)->issue($executor), LOCK_EX);
    file_put_contents($run."/privacy-subject-{$project}", $guardian->id, LOCK_EX);
    foreach (Student::orderBy('id')->limit(2)->get() as $linked) {
        GuardianAccess::forceCreate([
            'student_id' => $linked->id, 'guardian_id' => $guardian->id,
            'allowed_fields' => ['completed_lessons'], 'approved_by' => $operator->id,
        ]);
    }
    $authors[] = 'assignment-author-'.$project;
    $authors[] = 'exam-setup-'.$project;
    $authors[] = 'exam-reviewer-'.$project;
    $candidate = User::factory()->create(['email' => "exam-learner-{$project}@demo.example.test"]);
    $student = Student::factory()->create(['user_id' => $candidate->id, 'matric_number' => "EXAM/{$project}"]);
    Enrolment::factory()->create(['student_id' => $student->id, 'offering_id' => $offering->id]);
}
foreach ($authors as $login) {
    $user = User::factory()->create(['email' => $login.'@demo.example.test']);
    $lecturer = Lecturer::factory()->create(['user_id' => $user->id]);
    TeachingAllocation::factory()->create(['lecturer_id' => $lecturer->id, 'offering_id' => $offering->id]);
    app(ChangeRoleGrant::class)->apply($user->id, RoleCode::Lecturer, 'offering:'.$offering->id, false);
}

$examOfficer = User::factory()->create(['email' => 'exam-office@demo.example.test']);
app(ChangeRoleGrant::class)->apply($examOfficer->id, RoleCode::ExaminationOfficer, 'institution', false);
$quality = User::factory()->create(['email' => 'report-qa@demo.example.test']);
app(ChangeRoleGrant::class)->apply($quality->id, RoleCode::QualityAssuranceOfficer, 'institution', false);

foreach (['brand-desktop', 'brand-phone'] as $login) {
    $operator = User::factory()->create(['email' => $login.'@demo.example.test']);
    app(ChangeRoleGrant::class)->apply($operator->id, RoleCode::IctAdmin, 'institution', false);
}

foreach (['lecturer', 'officer', 'exam-office', 'report-qa', 'brand-desktop', 'brand-phone', ...$authors] as $role) {
    $account = User::where('email', $role.'@demo.example.test')->sole();
    $secret = app(TotpEnrollment::class)->issue($account);
    file_put_contents($run.'/'.$role.'.factor', $secret, LOCK_EX);
}

foreach (['desktop', 'phone'] as $project) {
    $course = Offering::factory()->create(['curriculum_course_id' => $offering->curriculum_course_id]);
    $teacher = User::where('email', "assignment-author-{$project}@demo.example.test")->sole();
    $student = Student::where('matric_number', "EXAM/{$project}")->sole();
    TeachingAllocation::factory()->create([
        'offering_id' => $course->id,
        'lecturer_id' => Lecturer::where('user_id', $teacher->id)->sole()->id,
    ]);
    app(ChangeRoleGrant::class)->apply($teacher->id, RoleCode::Lecturer, 'offering:'.$course->id, false);
    Enrolment::factory()->create(['student_id' => $student->id, 'offering_id' => $course->id]);
    file_put_contents($run.'/assignment-'.$project.'.course', $course->id);
}
