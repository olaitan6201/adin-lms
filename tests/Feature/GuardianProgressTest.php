<?php

namespace Tests\Feature;

use App\Models\Enrolment;
use App\Models\GuardianAccess;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\AuthoritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuardianProgressTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_the_approved_guardian_can_read_the_approved_field_until_revocation(): void
    {
        $this->seed(AuthoritySeeder::class);
        $guardian = User::factory()->create();
        $enrolment = Enrolment::factory()->create();
        $module = Module::factory()->create(['offering_id' => $enrolment->offering_id]);
        LessonProgress::forceCreate(['module_id' => $module->id, 'enrolment_id' => $enrolment->id,
            'last_seen' => now(), 'completed_at' => now()]);
        $url = route('guardian.progress', $enrolment->student_id);
        $this->artisan('authority:grant', ['user' => $guardian->id, 'role' => 'guardian', 'scope' => 'institution'])->assertSuccessful();
        $this->actingAs($guardian->fresh())->getJson($url)->assertForbidden();
        $approval = GuardianAccess::forceCreate([
            'student_id' => $enrolment->student_id, 'guardian_id' => $guardian->id,
            'allowed_fields' => ['name'], 'approved_by' => User::factory()->create()->id,
        ]);
        $this->getJson($url)->assertForbidden();
        $approval->allowed_fields = ['completed_lessons'];
        $approval->save();
        $this->getJson($url)->assertExactJson(['completed_lessons' => 1]);
        $this->getJson(route('guardian.progress', Student::factory()->create()))->assertForbidden();
        $stranger = User::factory()->create();
        $this->artisan('authority:grant', ['user' => $stranger->id, 'role' => 'guardian', 'scope' => 'institution'])->assertSuccessful();
        $this->actingAs($stranger->fresh())->getJson($url)->assertForbidden();

        $approval->revoked_at = now();
        $approval->save();
        $this->actingAs($guardian->fresh())->getJson($url)->assertForbidden();
    }
}
