<?php

use App\Models\Student;
use Tests\TestCase;

final class OwnerHistoryTest extends TestCase
{
    public function test_owner_reads_the_expected_results_on_the_actual_history_route(): void
    {
        $this->withoutVite();
        $student = Student::where('external_student_id', 'DEMO-TUNDE')->sole();
        $withdrawn = $student->enrolments()->where('status', 'withdrawn')->sole();
        $this->actingAs($student->user)->get(route('courses.show', $withdrawn->offering_id))->assertNotFound();
        $response = $this->get(route('students.history', $student))->assertOk();
        $rows = collect($response->viewData('page')['props']['records']);
        $pending = $rows->firstWhere('id', $withdrawn->id)['result'];
        if (getenv('QA_HISTORY_SIDE') === 'legacy') {
            $this->assertSame('A', $pending['grade']);
            $this->assertEquals('83.12345678', $pending['total_percent']);
        } else {
            $this->assertNull($pending);
        }
        $approved = $rows->firstWhere('status', 'registered')['result'];
        $this->assertSame('B', $approved['grade']);
        $this->assertEquals('77.12345678', $approved['total_percent']);
    }
}
