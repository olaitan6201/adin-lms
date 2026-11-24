<?php

namespace Tests\Feature;

use App\Enums\EnrolmentStatus;
use App\Models\Credential;
use App\Models\Enrolment;
use App\Models\Offering;
use App\Models\QuestionVersion;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_roster_edges_resolve_without_conflating_student_and_user_ids(): void
    {
        Student::forceCreate(['external_student_id' => 'UNLINKED']);
        $user = User::factory()->create();
        $student = Student::forceCreate(['external_student_id' => 'LINKED', 'user_id' => $user->id]);
        $offering = Offering::forceCreate(['external_offering_id' => 'CSC101-1']);
        $enrolment = Enrolment::forceCreate([
            'offering_id' => $offering->id,
            'student_id' => $student->id,
            'source_revision' => 1,
            'status' => EnrolmentStatus::Registered,
        ]);

        $this->assertTrue($enrolment->student->user->is($user));
        $this->assertTrue($offering->enrolments()->sole()->is($enrolment));
        $this->assertSame(EnrolmentStatus::Registered, $user->student->enrolments()->sole()->status);
        $this->assertArrayNotHasKey('password_hash', $user->toArray());
        $question = (new QuestionVersion)->forceFill(['marking_key' => ['answer' => 1]]);
        $this->assertArrayNotHasKey('marking_key', $question->toArray());
    }

    public function test_roster_shell_cannot_be_published_without_academic_approval(): void
    {
        $offering = Offering::forceCreate(['external_offering_id' => 'CSC101-1']);
        $this->expectException(QueryException::class);
        $offering->forceFill(['status' => 'published'])->save();
    }

    public function test_credential_uniqueness_uses_the_full_protected_value(): void
    {
        $attributes = ['kind' => 'test', 'user_id' => User::factory()->create()->id];
        $prefix = str_repeat('a', 256);
        Credential::forceCreate($attributes + ['protected_value' => $prefix.'1']);
        Credential::forceCreate($attributes + ['protected_value' => $prefix.'2']);

        $this->expectException(QueryException::class);
        Credential::forceCreate($attributes + ['protected_value' => $prefix.'1']);
    }
}
