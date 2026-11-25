<?php

namespace Tests\Feature\Insights;

use App\Models\Offering;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

final class InsightsActivityTest extends InsightCase
{
    use AssessmentFixture;

    public function test_exam_window_excludes_the_exact_close_instant(): void
    {
        $this->travelTo(Carbon::parse('2026-11-24 12:00:00', 'UTC'));
        $course = $this->assessmentFixture($this->loginAs('ada'));
        DB::table('examinations')->update(['opens_at' => now()->subHour(), 'closes_at' => now()]);

        $report = $this->data('/reports?offering='.$course->id);
        $this->assertSame(1, $report['table']['totals']['Exams']);
        $this->assertNotContains('Exam window', array_column($report['table']['rows'], 1));
    }

    public function test_reports_show_only_current_visible_activity_for_the_viewer(): void
    {
        $ada = $this->loginAs('ada');
        $course = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->firstOrFail();
        $filter = '?offering='.$course->id;
        $class = $this->record('classes', ['offering_id' => $course->id, 'title' => 'Workshop', 'status' => 'scheduled',
            'starts_at' => now()->addDay(), 'ends_at' => now()->addDays(2)]);
        $this->record('attendance', ['class_id' => $class, 'user_id' => $ada->id, 'status' => 'present', 'method' => 'manual', 'recorded_at' => now()]);
        foreach (['Released notice' => now(), 'Unpublished notice' => null] as $body => $time) {
            $this->record('announcements', ['offering_id' => $course->id, 'body' => $body, 'author_id' => $ada->id, 'published_at' => $time]);
        }
        $rows = $this->data('/reports'.$filter)['table']['rows'];
        $this->assertContains([$course->external_offering_id, 'Attendance', 'Workshop', 'Ada Demo · present'], $rows);
        $text = json_encode($rows);
        foreach (['Upcoming class', 'Released notice', 'First reading'] as $visible) {
            $this->assertStringContainsString($visible, $text);
        }
        $this->assertStringNotContainsString('Unpublished notice', $text);
        DB::table('modules')->where('offering_id', $course->id)->update(['kind' => 'draft:chapter']);
        $this->assertStringNotContainsString('First reading', json_encode($this->data('/reports'.$filter)['table']));
        $this->loginAs('lecturer');
        $this->assertStringContainsString('First reading', json_encode($this->data('/reports'.$filter)['table']));
    }

    public function test_result_and_exam_figures_follow_release_and_ownership(): void
    {
        $course = $this->assessmentFixture($this->loginAs('ada'));
        $q = '?offering='.$course->id;
        $this->loginAs('officer');
        $table = $this->data('/reports'.$q)['table'];
        $this->assertSame(1, $table['totals']['Exam attempts']);
        $this->assertStringContainsString('45.00 mean points', json_encode($table));
        $this->loginAs('tunde');
        $table = $this->data('/reports'.$q)['table'];
        $this->assertSame(0, $table['totals']['Exam attempts']);
        $this->assertSame(0, $table['totals']['Published results']);
        $this->assertStringNotContainsString('RECEIPT-ONE', json_encode($table));
        $this->loginAs('ada');
        DB::table('assessment_scores')->where('revision', 2)->update(['released_at' => now()]);
        DB::table('grades')->where('revision', 2)->update(['approved_at' => now(), 'approved_by' => auth()->id(),
            'moderation_status' => 'approved', 'published_at' => now(), 'grade' => 'A']);
        $text = json_encode($this->data('/reports'.$q)['table']['rows']);
        $this->assertStringContainsString('97.00 mean points', $text);
        $this->assertStringNotContainsString('PASS', $text);
    }
}
