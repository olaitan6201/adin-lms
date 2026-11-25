<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Assignment;
use App\Models\Enrolment;
use App\Models\Grade;
use App\Models\GradingPolicy;
use App\Models\Offering;
use App\Models\Student;
use App\Models\SubmissionVersion;
use Database\Seeders\DemoCampusSeeder;
use Database\Seeders\DemoTeachingWeekSeeder;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RegistrarHistoryContinuityTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_withdrawal_and_graduation_preserve_submitted_work_and_issued_result(): void
    {
        $admin = $this->academicUser();
        $this->seed([DemoCampusSeeder::class, DemoTeachingWeekSeeder::class]);
        $student = Student::where('external_student_id', 'DEMO-ADA')->sole();
        $course = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->sole();
        $enrolment = Enrolment::where('student_id', $student->id)->where('offering_id', $course->id)->sole();
        $this->actingAs($student->user)->post(route('assignments.submit', Assignment::sole()), ['body' => 'My reflection'])->assertSessionHasNoErrors();
        $submission = SubmissionVersion::sole();
        $grade = Grade::forceCreate(['enrolment_id' => $enrolment->id, 'policy_id' => GradingPolicy::sole()->id,
            'total_percent' => 75, 'grade' => 'A', 'revision' => 1, 'approved_by' => $admin->id,
            'approved_at' => now(), 'published_at' => now(), 'moderation_status' => 'approved']);
        $this->actingAs($admin)->withSession(['security.mfa_user' => $admin->id]);
        $upload = fn (string $text) => ['feed' => UploadedFile::fake()->createWithContent('registrar.csv', $text)];
        $this->post('/students/feeds/registrations', $upload("student_id,offering_id,status,revision\nDEMO-ADA,DEMO-CSC101-2026-1,withdrawn,2"))->assertSessionHasNoErrors();
        $this->post('/students/feeds/profiles', $upload("student_id,matric_number,name,email,programme,level,session,status\nDEMO-ADA,ADA/001,Ada,ada@example.test,DEMO-BSC,100 (demo),2026/27 (demo),graduated"))->assertSessionHasNoErrors();
        foreach ([$admin, $student->user] as $reader) {
            $this->actingAs($reader)->get(route('students.history', $student))->assertInertia(fn (AssertableInertia $p) => $p
                ->where('student.status', 'graduated')->where('sessions.0.department', 'Computing')->where('sessions.0.faculty', 'Science (demo)')
                ->where('records.0.status', 'withdrawn')->where('records.0.result.grade', 'A')->where('records.1.status', 'registered'));
        }
        $this->get(route('courses.show', $course))->assertNotFound();
        $this->assertSame($submission->receipt, $submission->fresh()->receipt);
        $this->assertSame($enrolment->id, $submission->fresh()->submission->enrolment_id);
        $this->assertSame($enrolment->id, $grade->fresh()->enrolment_id);
    }
}
