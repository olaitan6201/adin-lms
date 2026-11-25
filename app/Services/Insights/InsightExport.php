<?php

namespace App\Services\Insights;

use Dompdf\Dompdf;
use Illuminate\Support\Facades\Response;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

final class InsightExport
{
    public function download(InsightTable $table, ExportFormat $format): HttpResponse
    {
        if ($format === ExportFormat::Pdf) {
            $pdf = new Dompdf;
            $pdf->loadHtml(view('insights.pdf', ['table' => $table])->render(), 'UTF-8');
            $pdf->setPaper('A4', 'landscape');
            $pdf->render();

            return response($pdf->output(), 200, ['Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="academic-report.pdf"', 'Cache-Control' => 'private, no-store']);
        }

        return Response::streamDownload(function () use ($table): void {
            $book = new Spreadsheet;
            $sheet = $book->getActiveSheet();
            $sheet->setTitle('Academic report');
            $line = 1;
            foreach ($table->lines() as $row) {
                foreach ($row as $index => $value) {
                    $sheet->setCellValueExplicit([$index + 1, $line], $value, is_int($value) ? DataType::TYPE_NUMERIC : DataType::TYPE_STRING);
                }
                $line++;
            }
            $sheet->freezePane('A2');
            (new Xlsx($book))->save('php://output');
            $book->disconnectWorksheets();
        }, 'academic-report.xlsx', ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'private, no-store']);
    }
}
