<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class InstitutionDirectoryTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_admin_reconciles_stable_registrar_rows_and_reads_history_ict_cannot(): void
    {
        $this->academicUser();
        $csv = "student_id,offering_id,status,revision\nS1,CS101,registered,1\nS1,CS102,registered,1\n";
        $upload = fn (string $data) => ['feed' => UploadedFile::fake()->createWithContent('export.csv', $data)];
        $url = '/students/feeds/registrations';
        $this->post($url, $upload($csv))->assertSessionHas('roster_receipt', '2 registration changes applied.');
        $this->post($url, $upload($csv))->assertSessionHas('roster_receipt', '0 registration changes applied.');
        $this->post($url, $upload($csv."S1,CS102,withdrawn,2\nS1,CS101,withdrawn,1\n"))->assertSessionHasErrors(['feed' => 'Record 5: conflicting status at the same revision.']);
        $this->assertDatabaseMissing('enrolments', ['status' => 'withdrawn']);
        $this->post($url, $upload($csv."S1,CS102,withdrawn,2\n"))->assertSessionHasNoErrors();
        $student = Student::sole();
        $user = User::factory()->create();
        $identity = ['account' => $user->email, 'student' => 'S1'];
        $this->post('/students/link', $identity)->assertSessionHasErrors('verified');
        $this->post('/students/link', $identity + ['verified' => true])->assertSessionHasNoErrors();
        $this->post('/students/link', ['account' => User::factory()->create()->email, 'verified' => true] + $identity)->assertSessionHasErrors('account');
        $this->assertSame($user->id, $student->fresh()->user_id);
        $this->get('/students?q=S1')->assertInertia(fn (AssertableInertia $p) => $p->where('students.0.id', $student->id));
        $this->get(route('students.history', $student))->assertInertia(fn (AssertableInertia $p) => $p
            ->where('records.0.status', 'registered')->where('records.1.status', 'withdrawn'));

        $this->academicUser('ict_admin');
        $this->get('/students')->assertForbidden();
        $this->get(route('students.history', $student))->assertForbidden();
        $this->post($url, $upload($csv))->assertForbidden();
        $this->post('/students/link', $identity + ['verified' => true])->assertForbidden();
    }
}
