<?php

namespace Tests\Feature\Insights;

use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\Process\Process;

final class InsightsExportTest extends InsightCase
{
    use AssessmentFixture;

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
        $this->assertSame(1, $this->data('/dashboard'.$q)['table']['totals']['Pending marking (recipients)']);
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
