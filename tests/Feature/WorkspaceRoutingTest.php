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
        $this->assertCount(44, $routes);
        $this->assertCount(44, $routes->map(fn ($route) => $route->defaults['component'])->unique());
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

    public function test_demo_identity_and_assessment_actions_have_no_persistence_endpoint(): void
    {
        foreach (['workspace.auth.signin', 'workspace.auth.recover', 'workspace.student.exam'] as $screen) {
            $this->post(route($screen))->assertMethodNotAllowed();
        }
        $this->get('/admin/qa')->assertRedirectToRoute('login');
        $this->get('/student/downloads')->assertRedirectToRoute('login');
    }
}
