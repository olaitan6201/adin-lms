<?php

use App\Enums\RoleCode;
use App\Models\Enrolment;
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

$run = realpath((string) getenv('PORTAL_E2E_RUN'));
$sandbox = realpath(base_path('.agent-work/browser-tests'));
if (! $run || ! $sandbox || ! str_starts_with($run, $sandbox.'/run-')
    || ! $app->environment('testing') || DB::getDriverName() !== 'sqlite'
    || realpath(DB::connection()->getDatabaseName()) !== $run.'/portal.sqlite') {
    throw new LogicException('This fixture requires a disposable browser test database.');
}

umask(0077);
$offering = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->sole();
$authors = ['group-desktop', 'group-phone', 'lesson-desktop', 'lesson-phone'];
foreach (['desktop', 'phone'] as $project) {
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

foreach (['lecturer', 'officer', 'exam-office', ...$authors] as $role) {
    $account = User::where('email', $role.'@demo.example.test')->sole();
    $secret = app(TotpEnrollment::class)->issue($account);
    file_put_contents($run.'/'.$role.'.factor', $secret, LOCK_EX);
}
