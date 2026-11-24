<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Offering;
use App\Models\User;
use Database\Seeders\AuthoritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class LecturerDirectoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_registration_is_unique_and_only_admin_controls_allocations(): void
    {
        $this->withoutVite();
        $this->seed(AuthoritySeeder::class);
        $admin = User::factory()->create();
        $teacher = User::factory()->create();
        $department = Department::factory()->create();
        $offering = Offering::factory()->create();
        $profile = ['user_id' => $teacher->id, 'department_id' => $department->id, 'staff_number' => 'STAFF-24'];
        $args = ['staff_number' => 'STAFF-24', 'offering' => $offering->external_offering_id, 'operation' => 'assign'];
        $this->actingAs($teacher)->post('/staff', $profile)->assertForbidden();
        $this->artisan('authority:grant', ['user' => $admin->id, 'role' => 'institutional_admin', 'scope' => 'institution'])->assertSuccessful();
        $this->actingAs($admin->fresh())->withSession(['security.mfa_user' => $admin->id]);
        $this->get('/staff')->assertOk();
        $this->post('/staff', $profile)->assertSessionHasErrors('verified');
        $this->post('/staff', $profile + ['verified' => true])->assertRedirect(route('staff.index'));
        $this->post('/staff', $profile + ['verified' => true])->assertSessionHasErrors(['staff_number', 'user_id']);
        $this->post('/staff/allocations', $args)->assertRedirect(route('staff.index'));
        $this->post('/staff/allocations', $args)->assertRedirect(route('staff.index'));
        $this->assertDatabaseCount('teaching_allocations', 1);
        $this->get('/staff')->assertInertia(fn (AssertableInertia $page) => $page
            ->where('staff.0.offerings.0', $offering->external_offering_id));
        $this->actingAs($teacher->fresh())->withSession(['security.mfa_user' => $teacher->id]);
        $this->getJson(route('offerings.roster', $offering))->assertOk();
        $this->patch('/profile', ['full_name' => 'Updated Lecturer', 'staff_number' => 'WRONG'])->assertRedirect();
        $this->assertDatabaseHas('lecturers', $profile);
        $this->post('/staff/allocations', $args)->assertForbidden();
        $this->actingAs($admin->fresh())->withSession(['security.mfa_user' => $admin->id]);
        $this->post('/staff/allocations', array_merge($args, ['operation' => 'remove']))->assertRedirect(route('staff.index'));
        $this->actingAs($teacher->fresh())->getJson(route('offerings.roster', $offering))->assertForbidden();
    }
}
