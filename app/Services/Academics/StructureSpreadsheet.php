<?php

namespace App\Services\Academics;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Exception as SpreadsheetException;
use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use SplFileObject;
use ZipArchive;

final class StructureSpreadsheet
{
    private const int MAX_ROWS = 1001;

    private const int MAX_COLUMNS = 32;

    public function __construct(private Xlsx $reader = new Xlsx) {}

    /** @return array<int, list<string>> */
    public function read(UploadedFile $file): array
    {
        if (! $file->isValid() || $file->getSize() > 2 * 1024 * 1024) {
            $this->reject('Select a valid spreadsheet no larger than 2 MB.');
        }

        $path = $file->getPathname();
        $rows = match (strtolower($file->getClientOriginalExtension())) {
            'csv' => $this->csv($path),
            'xlsx' => $this->xlsx($path),
            default => $this->reject('Select a CSV or XLSX spreadsheet.'),
        };
        if (! isset($rows[1]) || count($rows) < 2) {
            $this->reject('Add column headers in row 1 and at least one data row.');
        }

        return $rows;
    }

    /** @return array<int, list<string>> */
    private function csv(string $path): array
    {
        $file = new SplFileObject($path);
        $file->setCsvControl(',', '"', '');
        if ($file->fread(3) !== "\xEF\xBB\xBF") {
            $file->rewind();
        }
        $rows = [];
        $line = 0;
        while (! $file->eof()) {
            $cells = $file->fgetcsv();
            if ($cells === false) {
                break;
            }
            $line++;
            if ($cells === [null]) {
                continue;
            }
            $this->append($rows, $line, $cells);
        }

        return $rows;
    }

    /** @return array<int, list<string>> */
    private function xlsx(string $path): array
    {
        $this->inspectArchive($path);
        $this->reader->setReadDataOnly(true);
        $this->reader->setReadEmptyCells(false);
        try {
            $sheets = $this->reader->listWorksheetInfo($path);
            if (count($sheets) !== 1) {
                $this->reject('Use one worksheet for the structure import.');
            }
            $info = $sheets[0];
            $this->checkBounds($info['totalRows'], $info['totalColumns']);
            $book = $this->reader->load($path);
        } catch (SpreadsheetException) {
            $this->reject('The XLSX workbook could not be read.');
        }

        $rows = [];
        try {
            $sheet = $book->getSheet(0);
            for ($line = 1; $line <= $info['totalRows']; $line++) {
                $cells = [];
                for ($column = 1; $column <= $info['totalColumns']; $column++) {
                    $address = Coordinate::stringFromColumnIndex($column).$line;
                    $cell = $sheet->getCell($address);
                    if ($cell->getDataType() === DataType::TYPE_FORMULA) {
                        $this->reject("Spreadsheet formulas are not allowed (row $line).");
                    }
                    $value = $cell->getValue();
                    $cells[] = (string) $value;
                }
                $this->append($rows, $line, $cells);
            }
        } finally {
            $book->disconnectWorksheets();
        }

        return $rows;
    }

    /** @param array<int, list<string>> $rows */
    private function append(array &$rows, int $line, array $cells): void
    {
        $this->checkBounds($line, count($cells));
        $values = [];
        foreach ($cells as $cell) {
            $value = (string) $cell;
            if (! mb_check_encoding($value, 'UTF-8') || str_contains($value, "\0") || strlen($value) > 2048) {
                $this->reject("Row $line contains an invalid or oversized cell.");
            }
            $values[] = trim($value);
        }
        if (array_filter($values, fn (string $value): bool => $value !== '')) {
            $rows[$line] = $values;
        }
    }

    private function checkBounds(int $rows, int $columns): void
    {
        if ($rows > self::MAX_ROWS || $columns > self::MAX_COLUMNS) {
            $this->reject('Use at most 1,000 data rows and 32 columns.');
        }
    }

    private function inspectArchive(string $path): void
    {
        $archive = new ZipArchive;
        if ($archive->open($path, ZipArchive::RDONLY) !== true) {
            $this->reject('The XLSX workbook could not be read.');
        }
        try {
            $bytes = 0;
            if ($archive->numFiles > 128) {
                $this->reject('The workbook has too many embedded files.');
            }
            for ($index = 0; $index < $archive->numFiles; $index++) {
                $entry = $archive->statIndex($index);
                if ($entry === false || $entry['encryption_method'] !== ZipArchive::EM_NONE) {
                    $this->reject('Encrypted workbooks are not supported.');
                }
                $bytes += $entry['size'];
                if ($bytes > 8 * 1024 * 1024) {
                    $this->reject('The workbook is too large when opened.');
                }
            }
        } finally {
            $archive->close();
        }
    }

    private function reject(string $message): never
    {
        throw ValidationException::withMessages(['file' => $message]);
    }
}
