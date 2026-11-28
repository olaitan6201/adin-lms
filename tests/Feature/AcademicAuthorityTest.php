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
            ['institutional_admin', ['Academic structure', 'Academic core', 'Curriculum', 'Delivery', 'Delivery links', 'Student directory', 'Staff directory', 'Calendar', 'Notification settings'], true, false],
            ['super_admin', ['Academic structure', 'Academic core', 'Curriculum', 'Delivery', 'Delivery links', 'Student directory', 'Staff directory', 'Calendar', 'Notification settings'], true, true],
            ['quality_assurance_officer', ['Academic core', 'Curriculum', 'Calendar', 'Quality review', 'Notification settings'], false, false],
            ['dean', ['Organisation', 'Calendar', 'Notification settings'], false, false],
            ['head_of_department', ['Organisation', 'Calendar', 'Notification settings'], false, false],
            ['student', ['Calendar', 'Notification settings'], false, false],
            ['registrar', ['Student placements', 'Notification settings'], false, false],
        ];
    }

    #[DataProvider('roles')]
    public function test_seeded_role_controls_navigation_and_matching_endpoints(
        string $role,
        array $labels,
        bool $manage,
        bool $approve,
    ): void {
        $department = Department::factory()->create();
        $scope = match ($role) {
            'dean' => 'faculty:'.$department->faculty_id,
            'head_of_department' => 'department:'.$department->id,
            default => 'institution',
        };
        $this->academicUser($role, $scope);
        $this->get('/courses')->assertInertia(
            fn (AssertableInertia $p) => $p->where(
                'academicLinks',
                function ($links) use ($labels, $manage): bool {
                    if ($links->pluck('label')->all() !== $labels) {
                        return false;
                    }

                    return ! $manage || $links->firstWhere('label', 'Academic structure')['href'] === '/admin/structure';
                },
            ),
        );
        $this->get('/admin/structure')->assertStatus($manage ? 200 : 403);
        $this->get('/academics')->assertStatus($manage || in_array('Organisation', $labels, true) ? 200 : 403);
        foreach (
            [
                'Curriculum' => '/academics/curriculum',
                'Academic core' => '/admin/academic-core',
                'Delivery' => '/academics/delivery',
                'Delivery links' => '/admin/delivery-links',
                'Student placements' => '/admin/placements',
            ] as $label => $url
        ) {
            $this->get($url)->assertStatus(in_array($label, $labels, true) ? 200 : 403);
        }

        $version = Curriculum::factory()->create(['status' => 'reviewed']);
        $this->post('/academics/organisation/levels', ['label' => '200'])->assertStatus($manage ? 302 : 403);
        $this->post('/academics/curriculum', [
            'programme_id' => $version->programme_id,
            'framework_revision' => '2026',
        ])->assertStatus($manage ? 302 : 403);
        $this->post("/academics/curriculum/$version->id/approve")->assertStatus($approve ? 302 : 403);
        $this->assertSame($approve ? 'approved' : 'reviewed', $version->refresh()->status->value);
    }
}
