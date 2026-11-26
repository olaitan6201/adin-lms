<?php

namespace Tests\Feature;

use App\Enums\OperationsEvent;
use App\Enums\RoleCode;
use App\Models\AuditLog;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;
use Database\Seeders\AuthoritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Page;
use Tests\TestCase;

class InstitutionBrandingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AuthoritySeeder::class);
        config(['branding.institution' => 'Configured College']);
    }

    public function test_operator_changes_identity_and_learner_reads_only_the_public_brand(): void
    {
        $this->get('/portal')->assertInertia(fn (Page $page) => $page->where('branding.institution', 'Configured College')
            ->where('branding.logoFull', asset(config('branding.logo_full'))));
        $actor = $this->signIn(RoleCode::IctAdmin);
        $image = UploadedFile::fake()->image('office-private-name.jpg', 75, 50);
        $this->post('/operations/branding', ['institution' => 'North & East College', 'logo' => $image])->assertRedirectToRoute('operations.index');
        $event = AuditLog::where('action', OperationsEvent::BrandingChanged)->sole();
        $this->assertSame($actor->id, $event->actor_id);
        $this->assertSame('North & East College', $event->details['institution']);
        $url = route('branding.logo', $event->details['logo'], false);
        $this->get(route('branding.logo', $actor->id))->assertNotFound();
        $this->signIn(RoleCode::Student);
        $this->get('/courses')->assertInertia(fn (Page $page) => $page->where('branding', [
            'institution' => 'North & East College', 'logoWhite' => $url, 'logoFull' => $url,
        ]));
        $response = $this->get($url)->assertOk()->assertHeader('Content-Type', 'image/png');
        $this->assertSame([75, 50], array_slice(getimagesizefromstring($response->getContent()), 0, 2));
        $this->assertStringStartsWith("\x89PNG", $response->getContent());
        $this->actingAs($actor)->withSession(['security.mfa_user' => $actor->id]);
        $this->post('/operations/branding', ['institution' => 'New name'])->assertRedirectToRoute('operations.index');
        $this->get($url)->assertOk();
        $this->post('/operations/branding', ['institution' => '', 'restore_logo' => '1'])->assertRedirectToRoute('operations.index');
        $this->get($url)->assertNotFound();
        $this->get('/portal')->assertInertia(fn (Page $page) => $page->where('branding.institution', 'Configured College')
            ->where('branding.logoWhite', asset(config('branding.logo_white'))));
    }

    public function test_unauthorized_and_invalid_writes_leave_no_setting_or_audit(): void
    {
        $this->post('/operations/branding', ['institution' => 'College'])->assertRedirectToRoute('login');
        $this->signIn(RoleCode::Student);
        $this->post('/operations/branding', ['institution' => 'College'])->assertForbidden();
        $this->signIn(RoleCode::SuperAdmin);
        $this->post('/operations/branding', [
            'institution' => '<b>College</b>', 'logo' => UploadedFile::fake()->createWithContent('logo.png', '<svg/>'),
        ])->assertSessionHasErrors(['institution', 'logo']);
        $this->post('/operations/branding', ['institution' => 'College', 'logo' => UploadedFile::fake()->image('large.png', 513, 1)])
            ->assertSessionHasErrors('logo');
        $this->post('/operations/branding', ['institution' => 'College', 'logo' => 'https://example.test/logo.png'])->assertSessionHasErrors('logo');
        $this->post('/operations/branding', [
            'institution' => 'College', 'restore_logo' => true, 'logo' => UploadedFile::fake()->image('logo.png'),
        ])->assertSessionHasErrors('logo');
        $this->assertDatabaseMissing('system_configuration', ['key' => 'branding.identity']);
        $this->assertDatabaseMissing('audit_logs', ['action' => OperationsEvent::BrandingChanged->value]);
    }

    private function signIn(RoleCode $role): User
    {
        $user = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($user->id, $role, 'institution', false);
        $this->actingAs($user)->withSession(['security.mfa_user' => $user->id]);

        return $user;
    }
}
