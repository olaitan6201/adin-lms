<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_enters_through_sign_in(): void
    {
        $this->get('/')->assertRedirectToRoute('login');
    }

    public function test_a_signed_in_user_enters_through_the_dashboard(): void
    {
        $this->actingAs(User::factory()->create())->get('/')->assertRedirectToRoute('insights.dashboard');
    }
}
