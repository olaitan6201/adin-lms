<?php

namespace Tests\Feature\Insights;

use App\Models\Offering;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class CohortReportsTest extends InsightCase
{
    use AssessmentFixture;

    public function test_completion_reconciles_at_institution_department_and_personal_scope(): void
    {
        $ada = $this->loginAs('ada');
        $course = $this->assessmentFixture($ada);
        $member = $ada->student->enrolments()->where('offering_id', $course->id)->sole();
        DB::table('enrolments')->where('id', $member->id)->update(['completed_at' => now()]);
        $this->loginAs('officer');
        $rows = $this->data('/reports?family=completion&term='.$course->semester_id)['table']['rows'];
        $this->assertSame(['Institution total', 2, 3, 1, '33.33%'], end($rows));
        $this->assertSame([2, 3, 1, '33.33%'], array_slice($rows[0], 1));
        $module = DB::table('modules')->where('offering_id', $course->id)->value('id');
        $this->record('lesson_progress', ['module_id' => $module, 'enrolment_id' => $member->id, 'last_seen' => now()]);
        $engagement = $this->data('/reports?family=engagement&offering='.$course->id)['table']['rows'];
        $this->assertSame([[$course->external_offering_id, 2, 1, 1, '50.00%']], $engagement);
        $this->loginAs('tunde');
        $q = '?offering='.$course->id;
        $this->assertSame(['Selection total', 1, 1, 0, '0.00%'], $this->data('/reports'.$q.'&family=completion')['table']['rows'][1]);
        $this->assertSame(0, $this->data('/reports'.$q.'&family=examinations')['table']['rows'][0][2]);
        $this->loginAs('ada');
        $this->assertSame('45.00', $this->data('/reports'.$q.'&family=examinations')['table']['rows'][0][3]);
        $this->get('/reports/export/xlsx'.$q.'&family=examinations')->assertDownload();
        $member->forceFill(['status' => 'withdrawn'])->save();
        foreach (['completion', 'engagement', 'attendance', 'examinations'] as $family) {
            $this->get('/reports/export/pdf'.$q.'&family='.$family)->assertNotFound();
        }
    }

    public function test_large_detail_and_attendance_exports_fail_closed_while_completion_remains_available(): void
    {
        $this->loginAs('ada');
        $course = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->sole();
        $class = ['offering_id' => $course->id, 'title' => 'Seminar', 'status' => 'scheduled',
            'starts_at' => now()->addDay(), 'ends_at' => now()->addDays(2)];
        foreach (array_chunk(range(1, 501), 75) as $batch) {
            DB::table('classes')->insert(array_map(fn () => ['id' => (string) Str::uuid7()] + $class, $batch));
        }
        foreach (['attendance', 'activity'] as $family) {
            $q = '?offering='.$course->id.'&family='.$family;
            $this->assertNotNull($this->data('/reports'.$q)['limitMessage']);
            foreach (['pdf', 'xlsx'] as $format) {
                $this->getJson("/reports/export/$format".$q)->assertUnprocessable();
            }
        }
        $this->get('/reports/export/pdf?family=completion')->assertDownload();
    }
}
