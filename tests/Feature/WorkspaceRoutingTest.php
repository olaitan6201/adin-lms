<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class WorkspaceRoutingTest extends TestCase
{
    public function test_every_public_workspace_deep_link_resolves_to_its_native_page(): void
    {
        $routes = collect(Route::getRoutes()->getRoutesByName())
            ->filter(fn ($route, string $name) => str_starts_with($name, 'workspace.'));
        $this->assertCount(40, $routes);
        $this->assertCount(40, $routes->map(fn ($route) => $route->defaults['component'])->unique());
        foreach ($routes as $name => $route) {
            $key = str_replace('.', '/', substr($name, strlen('workspace.')));
            $this->get(route($name))->assertInertia(fn (AssertableInertia $page) => $page
                ->component($route->defaults['component'], true)
                ->where('screenKey', $key)
                ->where('signedIn', false)
                ->where('portalIdentity', null)
                ->has('academicLinks', 0));
        }
    }

    public function test_demo_auth_routes_are_removed_and_account_routes_remain_available(): void
    {
        $this->get('/auth/signin')->assertNotFound();
        $this->get('/auth/recover')->assertNotFound();
        $this->get(route('login'))->assertInertia(fn (AssertableInertia $page) => $page->component('Auth/Login', true));
        $this->get(route('password.request'))->assertInertia(fn (AssertableInertia $page) => $page->component('Auth/ForgotPassword', true));
    }

    public function test_sample_exam_does_not_persist_and_private_pages_require_login(): void
    {
        $this->post(route('workspace.student.exam'))->assertMethodNotAllowed();
        $this->get('/admin/qa')->assertRedirectToRoute('login');
        $this->get('/student/downloads')->assertRedirectToRoute('login');
    }
}
