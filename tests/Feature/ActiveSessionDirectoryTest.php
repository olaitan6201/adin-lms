<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\AuthSession;
use App\Models\User;
use Inertia\Testing\AssertableInertia;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class ActiveSessionDirectoryTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public function test_only_operations_can_list_and_revoke_individual_active_sessions(): void
    {
        $user = User::factory()->create();
        $make = fn () => AuthSession::forceCreate(['user_id' => $user->id, 'token_digest' => hash('sha256', random_bytes(32)),
            'last_seen' => now(), 'expires_at' => now()->addHour()]);
        $first = $make();
        $second = $make();
        $expired = $make();
        $expired->forceFill(['expires_at' => now()->subMinute()])->save();
        $path = '/security/sessions';
        $this->academicUser();
        $this->get($path)->assertForbidden();
        $this->delete("$path/$first->id")->assertForbidden();
        $operator = $this->academicUser('ict_admin');
        $this->get($path)->assertInertia(fn (AssertableInertia $p) => $p->has('sessions', 2)->missing('sessions.0.token_digest'));
        $this->delete("$path/$first->id")->assertRedirect(route('security.sessions'));
        $this->get($path)->assertInertia(fn (AssertableInertia $p) => $p->has('sessions', 1)->where('sessions.0.id', $second->id));
        $this->assertNotNull($first->fresh()->revoked_at);
        $this->assertDatabaseHas('audit_logs', ['subject_key' => "session:$first->id", 'actor_id' => $operator->id]);
    }
}
