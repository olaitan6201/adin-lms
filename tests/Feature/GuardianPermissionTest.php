<?php

namespace Tests\Feature;

use App\Models\GuardianAccess;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\AuthoritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class GuardianPermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guardian_records_require_a_staff_approval_and_disappear_immediately_on_revocation(): void
    {
        $this->withoutVite();
        $this->seed(AuthoritySeeder::class);
        $admin = $this->account('super_admin');
        $guardian = $this->account('guardian');
        $other = $this->account('guardian');
        $student = Student::factory()->create();
        $form = ['guardian_email' => $guardian->email, 'student_reference' => $student->external_student_id];
        $path = route('guardian.permissions.index');
        $detail = route('guardian.progress', $student);
        $this->actingAs($guardian)->post($path, $form + ['confirmed' => 1])->assertForbidden();
        $this->actingAs($admin)->withSession(['security.mfa_user' => $admin->id])->get($path)->assertOk();
        $this->get('/profile')->assertInertia(fn (AssertableInertia $page) => $page
            ->where('guardianPermissionsUrl', '/guardian/permissions')->where('sharedProgressUrl', null));
        $this->post($path, $form)->assertSessionHasErrors('confirmed');
        $this->post($path, ['guardian_email' => $admin->email, 'confirmed' => 1] + $form)->assertSessionHasErrors('guardian_email');
        $this->assertDatabaseEmpty('guardian_access');
        $this->post($path, $form + ['confirmed' => 1, 'allowed_fields' => ['grades']])->assertRedirect($path);
        $approval = GuardianAccess::sole();
        $this->assertSame(['completed_lessons'], $approval->allowed_fields);
        $this->assertSame($admin->id, $approval->approved_by);
        $this->assertDatabaseHas('audit_logs', ['action' => 'guardian.progress.approved', 'actor_id' => $admin->id]);

        $this->actingAs($other)->get('/guardian')->assertInertia(fn (AssertableInertia $page) => $page->has('approvals', 0));
        $this->get($detail)->assertForbidden();
        $this->actingAs($guardian)->get('/guardian')->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Guardian/Progress')->has('approvals', 1)->where('approvals.0.href', $detail)->missing('student'));
        $this->get('/profile')->assertInertia(fn (AssertableInertia $page) => $page
            ->where('sharedProgressUrl', '/guardian')->where('guardianPermissionsUrl', null));
        $this->get($detail)->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Guardian/Progress')->where('completed_lessons', 0)->missing('student')->missing('grades'));
        $revoke = route('guardian.permissions.destroy', $approval);
        $this->delete($revoke)->assertForbidden();
        $this->actingAs($admin)->withSession(['security.mfa_user' => $admin->id])->delete($revoke)->assertRedirect($path);
        $this->assertDatabaseHas('audit_logs', ['action' => 'guardian.progress.revoked', 'actor_id' => $admin->id]);
        $this->actingAs($guardian)->get($detail)->assertForbidden();
        $this->get('/guardian')->assertInertia(fn (AssertableInertia $page) => $page->has('approvals', 0));
    }

    private function account(string $role): User
    {
        $user = User::factory()->create();
        $this->artisan('authority:grant', ['user' => $user->id, 'role' => $role, 'scope' => 'institution'])->assertSuccessful();

        return $user;
    }
}
