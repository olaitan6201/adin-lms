<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Department;
use App\Models\RoleGrant;
use App\Notifications\AccountResetLink;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class IdentityPortalTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_provision_status_and_privilege_boundaries(): void
    {
        Notification::fake();
        $data = ['email' => 'student@example.test', 'full_name' => 'Test Student'];
        $this->academicUser('ict_admin');
        $this->post('/accounts', $data)->assertForbidden();
        $super = $this->academicUser('super_admin');
        $admin = $this->academicUser();
        $this->post('/accounts', $data)->assertSessionHasNoErrors();
        $user = User::where('email', $data['email'])->sole();
        Notification::assertSentTo($user, AccountResetLink::class);
        $this->get('/accounts?q=student@example.test')->assertInertia(fn (AssertableInertia $p) => $p
            ->has('accounts', 1)->where('accounts.0.id', $user->id)->missing('accounts.0.password_hash'));
        foreach (['suspended', 'active'] as $status) {
            $this->patch("/accounts/$user->id", compact('status'))->assertSessionHasNoErrors();
            $this->assertSame($status, $user->fresh()->status);
        }
        foreach ([$admin, $super] as $protected) {
            $this->patch("/accounts/$protected->id", ['status' => 'suspended'])->assertSessionHasErrors('status');
            $this->assertSame('active', $protected->fresh()->status);
        }
    }

    public function test_super_admin_assigns_scoped_grant_inspects_permissions_and_revokes_only_from_target(): void
    {
        $user = User::factory()->create();
        $department = Department::factory()->create();
        $path = "/accounts/$user->id/access";
        $data = ['role' => 'head_of_department', 'reference' => $department->code];
        $admin = $this->academicUser();
        $this->post($path, $data)->assertForbidden();
        $super = $this->academicUser('super_admin');
        $this->post("/accounts/$super->id/access", $data)->assertForbidden();
        $this->post($path, ['reference' => 'unknown'] + $data)->assertSessionHasErrors('reference');
        $this->post($path, $data)->assertSessionHasNoErrors();
        $grant = RoleGrant::where('user_id', $user->id)->sole();
        $this->get($path)->assertInertia(fn (AssertableInertia $p) => $p->where('grants.0.scope', $department->name)
            ->where('grants.0.permissions.0', 'roster.read'));
        $this->delete("/accounts/$admin->id/access/$grant->id")->assertNotFound();
        $this->delete("$path/$grant->id")->assertRedirect();
        $this->assertDatabaseMissing('role_grants', ['id' => $grant->id]);
        $this->assertDatabaseHas('audit_logs', ['actor_id' => $super->id, 'subject_key' => "user:$user->id", 'action' => 'role.revoked']);
    }
}
