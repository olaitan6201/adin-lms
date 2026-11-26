<?php

namespace Tests\Feature\Insights;

use Illuminate\Support\Facades\DB;

final class CalendarTest extends InsightCase
{
    use AssessmentFixture;

    public function test_calendar_shows_registered_agenda_and_loses_withdrawn_work(): void
    {
        $this->get('/calendar')->assertRedirect(route('login'));
        $student = $this->loginAs('ada');
        $course = $this->assessmentFixture($student);
        $data = $this->data('/calendar');
        $this->assertSame(['=Outstanding'], array_column($data['events'], 'title'));
        $this->get($data['events'][0]['href'])->assertOk();
        DB::table('enrolments')->where('student_id', $student->student->id)->update(['status' => 'withdrawn']);
        $data = $this->data('/calendar?offering='.$course->id);
        $this->assertSame([], $data['events']);
        $this->assertSame([], $data['terms']);
    }

    public function test_lecturer_deadlines_require_allocation_and_institution_calendar_uses_real_term_dates(): void
    {
        $course = $this->assessmentFixture($this->loginAs('ada'));
        $teacher = $this->loginAs('lecturer');
        $this->record('classes', ['offering_id' => $course->id, 'title' => 'Allocated tutorial', 'status' => 'scheduled',
            'starts_at' => now()->addDay(), 'ends_at' => now()->addDays(2)]);
        $titles = array_column($this->data('/calendar')['events'], 'title');
        $this->assertContains('=Outstanding', $titles);
        $this->assertContains('Allocated tutorial', $titles);
        DB::table('teaching_allocations')->where('lecturer_id', $teacher->lecturer->id)->where('offering_id', $course->id)->delete();
        $this->assertSame([], $this->data('/calendar')['events']);
        $this->loginAs('officer');
        $termStart = DB::table('semesters')->where('id', $course->semester_id)->value('starts_on');
        $this->assertContains($termStart, array_column($this->data('/calendar')['terms'], 'starts_on'));
    }
}
