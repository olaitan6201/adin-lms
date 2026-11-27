<?php

namespace Tests\Unit;

use App\Services\Academics\StructureSpreadsheet;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class StructureSpreadsheetTest extends TestCase
{
    public function test_csv_preserves_source_rows_and_text_codes(): void
    {
        $file = UploadedFile::fake()->createWithContent(
            'structure.csv',
            "\xEF\xBB\xBF\"Code\",Title\n\n001,\"Arts, Media\"\n",
        );

        $this->assertSame([
            1 => ['Code', 'Title'],
            3 => ['001', 'Arts, Media'],
        ], (new StructureSpreadsheet)->read($file));
    }

    public function test_xlsx_never_evaluates_formulas(): void
    {
        $file = $this->workbook('=1+1');

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Spreadsheet formulas are not allowed (row 2).');
        (new StructureSpreadsheet)->read($file);
    }

    public function test_xlsx_preserves_codes_entered_as_text(): void
    {
        $this->assertSame([
            1 => ['Code', 'Title'],
            2 => ['001', 'Arts'],
        ], (new StructureSpreadsheet)->read($this->workbook('Arts')));
    }

    private function workbook(string $name): UploadedFile
    {
        $file = UploadedFile::fake()->create('structure.xlsx');
        $book = new Spreadsheet;
        $sheet = $book->getActiveSheet();
        $sheet->fromArray([['Code', 'Title'], [null, $name]]);
        $sheet->setCellValueExplicit('A2', '001', DataType::TYPE_STRING);
        $writer = new Xlsx($book);
        $writer->setPreCalculateFormulas(false);
        $writer->save($file->getPathname());
        $book->disconnectWorksheets();

        return $file;
    }
}
