<?php

namespace Tests\Feature\Insights;

use App\Models\AssessmentItem;
use App\Models\Grade;
use App\Models\Module;
use App\Models\Offering;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\Process\Process;

final class InsightsExportTest extends InsightCase
{
    use AssessmentFixture;

    public function test_exam_window_matches_new_york_preview_in_utc_on_report_and_downloads(): void
    {
        $this->travelTo(CarbonImmutable::parse('2027-01-15 23:50:00 UTC'));
        $course = $this->assessmentFixture($this->loginAs('ada'));
        $previewStart = CarbonImmutable::parse('2027-01-15 18:45', 'America/New_York');
        $previewEnd = CarbonImmutable::parse('2027-01-15 19:15', 'America/New_York');
        DB::table('examinations')->update(['opens_at' => $previewStart->utc(), 'closes_at' => $previewEnd->utc()]);
        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SET LOCAL TIME ZONE 'America/New_York'");
        }

        $expected = '2027-01-15 23:45:00 UTC – 2027-01-16 00:15:00 UTC';
        $row = [$course->external_offering_id, 'Exam window', 'Exam One', $expected];
        $query = '?offering='.$course->id;
        $this->assertContains($row, $this->data('/reports'.$query)['table']['rows']);
        $this->assertContains($row, $this->sheet($query));
        $this->assertStringContainsString($expected, preg_replace('/\s+/u', ' ', $this->pdfText($query)));
    }

    public function test_student_downloads_follow_lesson_completion_and_actual_grade_publication(): void
    {
        $course = Offering::where('external_offering_id', 'DEMO-CSC101-2026-1')->sole();
        $lesson = Module::whereOfferingId($course->id)->sole();
        $this->loginAs('lecturer');
        $this->post(route('learning.revisions.store', [$course, $lesson]), [
            'title' => 'Report reading', 'body' => 'Read this before class.', 'download_allowed' => false,
        ])->assertSessionHasNoErrors()->assertRedirect();
        $this->post("/courses/$course->id/assessments", ['rounding' => 'half_up',
            'items' => [['kind' => 'manual', 'title' => 'Portfolio', 'weight' => 100, 'maximum' => 10]],
            'boundaries' => [['minimum' => 0, 'grade' => 'RESULT-MERIT']],
        ])->assertSessionHasNoErrors()->assertRedirect();
        $student = $this->loginAs('ada');
        $this->post(route('learning.complete', [$course, $lesson]))->assertRedirect();
        $member = $course->enrolments()->where('student_id', $student->student->id)->sole();
        $this->loginAs('lecturer');
        $item = AssessmentItem::where('title', 'Portfolio')->sole();
        $this->post("/assessment-items/$item->id/score", ['enrolment' => $member->id, 'points' => '8.125',
            'reason' => 'Portfolio review'])->assertSessionHasNoErrors()->assertRedirect();
        $this->post("/gradebooks/$item->gradebook_id/compute/$member->id")->assertRedirect();
        $grade = Grade::where('enrolment_id', $member->id)->sole();
        $review = "/grades/$grade->id/review";
        $officer = $this->loginAs('officer');
        $this->artisan('authority:grant', ['user' => $officer->id, 'role' => 'examination_officer', 'scope' => 'institution'])->assertSuccessful();
        $this->post($review, ['decision' => 'approve', 'reason' => 'Checked'])->assertRedirect();
        $query = '?offering='.$course->id;
        $download = function () use ($query): array {
            return [json_encode($this->sheet($query), JSON_THROW_ON_ERROR), $this->pdfText($query)];
        };
        $this->loginAs('ada');
        foreach ($download() as $text) {
            $this->assertStringContainsString('Report reading', $text);
            $this->assertStringNotContainsString('RESULT-MERIT', $text);
        }

        $this->assertSame(1, $this->data('/reports'.$query)['table']['totals']['Completed lessons']);
        $this->loginAs('officer');
        $this->post($review, ['decision' => 'publish', 'reason' => 'Release'])->assertRedirect();
        $this->loginAs('ada');
        foreach ($download() as $text) {
            $this->assertStringContainsString('RESULT-MERIT', $text);
            $this->assertStringContainsString('81.25', $text);
            $this->assertStringNotContainsString('8.125', $text);
        }

        $this->loginAs('tunde');
        foreach ($download() as $text) {
            $this->assertStringNotContainsString('RESULT-MERIT', $text);
        }
    }

    public function test_student_report_and_exports_match_filtered_rows_and_exclude_unreleased_revisions(): void
    {
        $course = $this->assessmentFixture($this->loginAs('ada'));
        $q = '?offering='.$course->id;
        $report = $this->data('/reports'.$q);
        $table = $report['table'];
        $this->assertSame(1, $table['totals']['Exam attempts']);
        $this->assertSame(1, $table['totals']['Submissions']);
        $text = json_encode($table, JSON_THROW_ON_ERROR);
        foreach (['45.00 mean points', 'PASS', '=Outstanding', 'RECEIPT-ONE'] as $expected) {
            $this->assertStringContainsString($expected, $text);
        }

        foreach (['UNRELEASED', 'NOT-MODERATED', 'Tunde Demo', 'CSC102'] as $hidden) {
            $this->assertStringNotContainsString($hidden, $text);
        }

        $rows = [$report['columns']];
        foreach ($table['totals'] as $name => $value) {
            $rows[] = ['', 'Total', $name, $value];
        }

        array_push($rows, ...$table['rows']);
        $this->assertSame($rows, $this->sheet($q));
        $pdf = $this->pdfText($q);
        foreach ($table['totals'] as $key => $value) {
            $this->assertMatchesRegularExpression('/Total\s+'.preg_quote($key, '/').'\s+'.$value.'\b/', $pdf);
        }

        foreach (['PASS', '45.00 mean points', 'RECEIPT-ONE', '=Outstanding'] as $expected) {
            $this->assertStringContainsString($expected, $pdf);
        }

        $this->assertStringNotContainsString('UNRELEASED', $pdf);
        $this->assertStringNotContainsString('Tunde', $pdf);
        $this->loginAs('lecturer');
        $this->assertSame(1, $this->data('/reports'.$q)['table']['totals']['Pending marking (recipients)']);
    }

    public function test_empty_selection_never_falls_back_to_all_records(): void
    {
        $this->loginAs('ada');
        $q = '?session='.Str::uuid7();
        $sheet = $this->sheet($q);
        foreach (array_slice($sheet, 1) as $row) {
            $this->assertSame('Total', $row[1]);
            $this->assertSame(0, $row[3]);
        }

        $pdf = $this->pdfText($q);
        $this->assertStringContainsString('Registered students', $pdf);
        $this->assertStringNotContainsString('DEMO-CSC', $pdf);
        $this->getJson('/reports/export/pdf?term=invalid')->assertUnprocessable();
    }

    private function sheet(string $query): array
    {
        $response = $this->get('/reports/export/xlsx'.$query)->assertDownload('academic-report.xlsx');
        $path = tempnam(sys_get_temp_dir(), 'report-');
        try {
            file_put_contents($path, $response->streamedContent());
            $sheet = IOFactory::load($path)->getActiveSheet();
            foreach ($sheet->getCellCollection()->getCoordinates() as $coordinate) {
                $this->assertNotSame('f', $sheet->getCell($coordinate)->getDataType());
            }

            return $sheet->toArray('', false, false);
        } finally {
            unlink($path);
        }
    }

    private function pdfText(string $query): string
    {
        $response = $this->get('/reports/export/pdf'.$query)->assertDownload('academic-report.pdf');
        $extract = new Process(['pdftotext', '-layout', '-', '-']);
        $extract->setInput($response->getContent())->mustRun();

        return $extract->getOutput();
    }
}
