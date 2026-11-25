<?php

namespace Tests\Feature\Insights;

use App\Enums\RoleCode;
use App\Models\AcademicSession;
use App\Models\Offering;
use App\Models\User;
use App\Services\Authority\ChangeRoleGrant;

final class ReportContextTest extends InsightCase
{
    public function test_quality_officer_without_course_access_is_identified_even_with_filters(): void
    {
        $qa = User::factory()->create();
        app(ChangeRoleGrant::class)->apply($qa->id, RoleCode::QualityAssuranceOfficer, 'institution', false);
        $this->actingAs($qa)->withSession(['security.mfa_user' => $qa->id]);
        $session = AcademicSession::firstOrFail();
        foreach (['', "?session=$session->id"] as $query) {
            $page = $this->data('/reports'.$query);
            $this->assertSame('Quality assurance', $page['audience']);
            $this->assertNull($page['reportScope']);
            $this->assertFalse($page['canViewInstitutionUsage']);
            $this->assertSame([], $page['table']['rows']);
            $this->assertSame([], $page['options']['offering']);
        }

        $course = Offering::firstOrFail();
        foreach (['/reports', '/reports/export/pdf', '/reports/export/xlsx'] as $path) {
            $this->get("$path?offering=$course->id")->assertNotFound();
            $this->get("$path?family=institution-usage")->assertForbidden();
        }
    }

    public function test_dual_role_preserves_personal_scope_and_empty_filtered_results(): void
    {
        $student = $this->loginAs('ada');
        $before = $this->data('/reports');
        $this->assertSame('Student', $before['audience']);
        $this->assertSame('Your registered courses', $before['reportScope']);
        app(ChangeRoleGrant::class)->apply($student->id, RoleCode::QualityAssuranceOfficer, 'institution', false);
        $page = $this->data('/reports');
        $this->assertSame('Quality assurance', $page['audience']);
        $this->assertSame('Your registered courses', $page['reportScope']);
        $this->assertSame($before['table'], $page['table']);
        $empty = AcademicSession::factory()->create();
        $filtered = $this->data("/reports?session=$empty->id");
        $this->assertSame('Quality assurance', $filtered['audience']);
        $this->assertSame('Your registered courses', $filtered['reportScope']);
        $this->assertSame([], $filtered['table']['rows']);
        $course = $before['options']['offering'][0]['id'];
        $this->get("/reports/export/xlsx?offering=$course")->assertDownload();
        $this->get('/reports/export/xlsx?family=institution-usage')->assertForbidden();
    }
}
