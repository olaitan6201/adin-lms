<?php

namespace Tests\Feature;

use App\Models\Curriculum;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\Support\AcademicAccess;
use Tests\TestCase;

class AcademicAuthorityTest extends TestCase
{
    use AcademicAccess, RefreshDatabase;

    public static function roles(): array
    {
        return [
            ['institutional_admin', ['Organisation', 'Curriculum', 'Delivery'], true, false],
            ['super_admin', ['Organisation', 'Curriculum', 'Delivery'], true, true],
            ['quality_assurance_officer', ['Curriculum'], false, false],
            ['dean', ['Organisation'], false, false], ['head_of_department', ['Organisation'], false, false],
            ['student', [], false, false],
        ];
    }

    #[DataProvider('roles')]
    public function test_seeded_role_controls_navigation_and_matching_endpoints(string $role, array $labels, bool $manage, bool $approve): void
    {
        $department = Department::factory()->create();
        $scope = match ($role) {
            'dean' => 'faculty:'.$department->faculty_id, 'head_of_department' => 'department:'.$department->id, default => 'institution',
        };
        $this->academicUser($role, $scope);
        $this->get('/courses')->assertInertia(fn (AssertableInertia $p) => $p->where('academicLinks', fn ($links) => $links->pluck('label')->all() === $labels));
        foreach (['Organisation' => '/academics', 'Curriculum' => '/academics/curriculum', 'Delivery' => '/academics/delivery'] as $label => $url) {
            $this->get($url)->assertStatus(in_array($label, $labels, true) ? 200 : 403);
        }
        $version = Curriculum::factory()->create(['status' => 'reviewed']);
        $this->post('/academics/organisation/levels', ['label' => '200'])->assertStatus($manage ? 302 : 403);
        $this->post('/academics/curriculum', ['programme_id' => $version->programme_id, 'framework_revision' => '2026'])->assertStatus($manage ? 302 : 403);
        $this->post("/academics/curriculum/$version->id/approve")->assertStatus($approve ? 302 : 403);
        $this->assertSame($approve ? 'approved' : 'reviewed', $version->refresh()->status);
    }
}
