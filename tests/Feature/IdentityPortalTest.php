<?php

namespace Tests\Feature;

use App\Enums\AccountStatus;
use App\Enums\RoleCode;
use App\Models\Department;
use App\Models\RoleGrant;
use App\Models\User;
use App\Notifications\AccountResetLink;
use App\Services\Authority\ChangeRoleGrant;
use App\Services\Identity\AccountAccess;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia;
use Symfony\Component\HttpKernel\Exception\HttpException;
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
        $this->get('/accounts?q=student@example.test')
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('accounts', 1)
                ->where('accounts.0.id', $user->id)
                ->where('accounts.0.status', 'active')
                ->missing('accounts.0.password_hash'));
        $this->patch("/accounts/$user->id", ['status' => 'unknown'])
            ->assertSessionHasErrors('status');
        $this->patch("/accounts/$user->id", ['status' => AccountStatus::Disabled->value])
            ->assertSessionHasErrors('status');
        foreach ([AccountStatus::Suspended, AccountStatus::Active] as $status) {
            $this->patch("/accounts/$user->id", ['status' => $status->value])
                ->assertSessionHasNoErrors();
            $this->assertSame($status, $user->fresh()->status);
        }

        foreach ([$admin, $super] as $protected) {
            $this->patch("/accounts/$protected->id", ['status' => 'suspended'])->assertSessionHasErrors('status');
            $this->assertSame(AccountStatus::Active, $protected->fresh()->status);
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

    public function test_revoked_authority_is_rechecked_before_a_grant_is_written(): void
    {
        $admin = $this->academicUser('super_admin');
        $actor = $admin->fresh();
        $target = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($actor->id, RoleCode::SuperAdmin, 'institution', true);

        try {
            app(AccountAccess::class)->grant($actor, $target, RoleCode::InstitutionalAdmin, '');
            $this->fail('A stale actor must not write a grant.');
        } catch (HttpException $error) {
            $this->assertSame(403, $error->getStatusCode());
        }

        $this->assertDatabaseMissing('role_grants', ['user_id' => $target->id]);
    }

    public function test_current_actor_without_grants_permission_cannot_write_through_the_service(): void
    {
        $admin = $this->academicUser();
        $actor = $admin->fresh();
        $target = User::factory()->create();
        $access = app(AccountAccess::class);

        try {
            $access->grant($actor, $target, RoleCode::InstitutionalAdmin, '');
            $this->fail('The grant policy must also be applied inside the service.');
        } catch (AuthorizationException $error) {
            $this->assertFalse($error->response()->allowed());
        }

        $this->assertDatabaseMissing('role_grants', ['user_id' => $target->id]);
        $this->assertDatabaseMissing('audit_logs', [
            'actor_id' => $actor->id,
            'subject_key' => 'user:'.$target->id,
            'action' => 'role.granted',
        ]);
    }
}
