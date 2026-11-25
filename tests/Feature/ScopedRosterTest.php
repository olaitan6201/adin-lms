<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\CurriculumCourse;
use App\Models\Department;
use App\Models\Enrolment;
use App\Models\Lecturer;
use App\Models\Offering;
use App\Models\Permission;
use App\Models\RolePermission;
use App\Models\TeachingAllocation;
use App\Models\User;
use App\Services\Authority\ScopedAuthority;
use Database\Seeders\AuthoritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ScopedRosterTest extends TestCase
{
    use RefreshDatabase;

    public static function scopedRoles(): array
    {
        return [['dean'], ['head_of_department'], ['lecturer']];
    }

    #[DataProvider('scopedRoles')]
    public function test_staff_can_only_read_the_assigned_roster(string $role): void
    {
        $this->seed(AuthoritySeeder::class);
        $entry = CurriculumCourse::factory()->create();
        $offering = Offering::factory()->create(['curriculum_course_id' => $entry->id]);
        $outside = Offering::factory()->create(['curriculum_course_id' => CurriculumCourse::factory()]);
        $member = Enrolment::factory()->create(['offering_id' => $offering->id]);
        Enrolment::factory()->withdrawn()->create(['offering_id' => $offering->id]);
        Enrolment::factory()->create(['offering_id' => $outside->id]);
        $user = User::factory()->create();
        $scope = match ($role) {
            'dean' => 'faculty:'.$entry->course->department->faculty_id,
            'head_of_department' => 'department:'.$entry->course->department_id,
            'lecturer' => 'offering:'.$offering->id,
        };
        $args = ['user' => $user->id, 'role' => $role, 'scope' => $scope];
        $this->artisan('authority:grant', array_merge($args, ['scope' => 'institution']))->assertFailed();
        $this->artisan('authority:grant', $args)->assertSuccessful();
        $this->artisan('authority:grant', $args)->assertSuccessful();
        $this->assertDatabaseCount('role_grants', 1);
        $this->assertDatabaseCount('audit_logs', 1);
        $this->assertTrue(app(ScopedAuthority::class)->requiresMfa($user));
        $url = route('offerings.roster', $offering);
        $this->getJson($url)->assertUnauthorized();
        $this->actingAs($user->fresh())->withSession(['security.mfa_user' => $user->id]);
        if ($role === 'lecturer') {
            $this->getJson($url)->assertForbidden();
            $lecturer = Lecturer::factory()->create(['user_id' => $user->id]);
            TeachingAllocation::factory()->create(['lecturer_id' => $lecturer->id, 'offering_id' => $offering->id]);
        }

        $this->getJson($url)->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.student_id', $member->student_id)
            ->assertJsonMissingPath('data.0.email');
        $this->getJson(route('offerings.roster', $outside))->assertForbidden();
        $siblingDepartment = Department::factory()->create(['faculty_id' => $entry->course->department->faculty_id]);
        $siblingCourse = Course::factory()->create(['department_id' => $siblingDepartment->id]);
        $siblingEntry = CurriculumCourse::factory()->create(['course_id' => $siblingCourse->id]);
        $siblingOffering = Offering::factory()->create(['curriculum_course_id' => $siblingEntry->id]);
        $this->getJson(route('offerings.roster', $siblingOffering))->assertStatus($role === 'dean' ? 200 : 403);
        $this->artisan('authority:grant', $args + ['--revoke' => true])->assertSuccessful();
        $this->getJson($url)->assertForbidden();
        $this->assertFalse(app(ScopedAuthority::class)->requiresMfa($user));
    }

    public static function institutionRoles(): array
    {
        return [
            ['super_admin', 'accounts.manage', true], ['institutional_admin', 'accounts.manage', true],
            ['ict_admin', 'login_events.read', false], ['quality_assurance_officer', 'compliance.read', false],
            ['examination_officer', 'examinations.manage', false], ['student', 'courses.read_own', false],
            ['guardian', 'progress.read_approved', false],
        ];
    }

    #[DataProvider('institutionRoles')]
    public function test_institution_scope_alone_does_not_authorize_roster_access(string $role, string $ability, bool $allowed): void
    {
        $this->seed(AuthoritySeeder::class);
        $user = User::factory()->create();
        $authority = app(ScopedAuthority::class);
        $this->assertFalse($authority->institutionAllows($user, $ability));
        $this->artisan('authority:grant', ['user' => $user->id, 'role' => $role, 'scope' => 'institution'])->assertSuccessful();
        $this->assertTrue($authority->institutionAllows($user, $ability));
        $this->assertSame(! in_array($role, ['guardian', 'student'], true), $authority->requiresMfa($user));
        $url = route('offerings.roster', Offering::factory()->create());
        $this->actingAs($user->fresh())->withSession(['security.mfa_user' => $user->id])
            ->getJson($url)->assertStatus($allowed ? 200 : 403);
        if ($allowed) {
            RolePermission::where('permission_id', Permission::where('code', 'roster.read')->value('id'))->delete();
            $this->getJson($url)->assertForbidden();
        }
    }
}
