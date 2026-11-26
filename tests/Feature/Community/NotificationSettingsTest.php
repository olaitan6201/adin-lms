<?php

namespace Tests\Feature\Community;

use Inertia\Testing\AssertableInertia as Assert;

final class NotificationSettingsTest extends CommunityTestCase
{
    public function test_settings_require_login_and_show_only_the_signed_in_students_destination(): void
    {
        $url = route('community.notifications.settings');
        $this->get($url)->assertRedirect(route('login'));
        $student = $this->person('ada');
        $this->actingAs($student)->get($url.'?user_id='.$this->person('tunde')->id)
            ->assertInertia(fn (Assert $page) => $page->component('Community/NotificationSettings')
                ->where('email', $student->email)
                ->where('profileUrl', '/profile')
                ->where('sessionsUrl', null));
        $this->patch($url, ['email' => false])->assertMethodNotAllowed();
    }

    public function test_operations_staff_have_the_institutional_sessions_link(): void
    {
        $officer = $this->person('officer');
        $this->artisan('authority:grant', ['user' => $officer->id, 'role' => 'ict_admin', 'scope' => 'institution'])->assertSuccessful();
        $this->actingAs($officer)->withSession(['security.mfa_user' => $officer->id])
            ->get(route('community.notifications.settings'))
            ->assertInertia(fn (Assert $page) => $page->where('sessionsUrl', '/security/sessions'));
    }
}
