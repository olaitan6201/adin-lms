<?php

namespace App\Services\Academics;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class PlacementCsv
{
    private const HEADER = [
        'registration_id', 'update_number', 'student_id', 'pathway_id',
        'session_id', 'cohort_id', 'programme_level_id', 'effective_on',
    ];

    private const MAX_BYTES = 262144;

    private const MAX_ROWS = 500;

    public function template(): string
    {
        return implode(',', self::HEADER)."\r\n";
    }

    /** @return list<PlacementCsvRow> */
    public function read(UploadedFile $file): array
    {
        $path = $file->getRealPath();
        if (! $file->isValid() || $path === false || $file->getSize() > self::MAX_BYTES) {
            throw ValidationException::withMessages(['file' => 'Choose a readable CSV file no larger than 256 KB.']);
        }

        $stream = fopen($path, 'rb');
        if ($stream === false) {
            throw ValidationException::withMessages(['file' => 'The CSV file could not be read.']);
        }

        try {
            $header = fgets($stream, 2048);
            if ($header === false || $this->fields(Str::chopStart($header, "\xEF\xBB\xBF"), 1) !== self::HEADER) {
                throw ValidationException::withMessages(['file' => 'Use the placement CSV template without changing its column names.']);
            }

            $rows = [];
            while (($line = fgets($stream, 2048)) !== false) {
                if (count($rows) === self::MAX_ROWS) {
                    throw ValidationException::withMessages(['file' => 'Use up to 500 updates per file.']);
                }

                $number = count($rows) + 2;
                $rows[] = $this->parse($this->fields($line, $number), $number);
            }

            return $rows;
        } finally {
            fclose($stream);
        }
    }

    /** @return list<string|null> */
    private function fields(string $line, int $number): array
    {
        $record = rtrim($line, "\r\n");
        if (! preg_match('/\A(?:"[^"\r\n]*"|[^,"\r\n]*)(?:,(?:"[^"\r\n]*"|[^,"\r\n]*))*\z/', $record)) {
            $this->reject($number, 'use one well-formed CSV record per line.');
        }

        return str_getcsv($record, ',', '"', '');
    }

    /** @param list<string|null> $fields */
    private function parse(array $fields, int $line): PlacementCsvRow
    {
        if (count($fields) !== count(self::HEADER)) {
            $this->reject($line, 'use all template columns.');
        }

        [$registration, $number, $student, $pathway, $session, $cohort, $level, $date] = $fields;
        if (! $this->schoolId($registration) || ! $this->schoolId($student)) {
            $this->reject($line, 'provide a valid school registration and student ID.');
        }

        if (! is_string($number) || ! preg_match('/\A[1-9][0-9]{0,8}\z/', $number)) {
            $this->reject($line, 'provide a positive whole update number.');
        }

        foreach ([$pathway, $session, $cohort, $level] as $key) {
            if (! is_string($key) || ! Str::isUuid($key)) {
                $this->reject($line, 'use UUIDs from the academic registers.');
            }
        }

        if (! is_string($date) || ! preg_match('/\A([1-9][0-9]{3})-([0-9]{2})-([0-9]{2})\z/', $date, $parts)
            || ! checkdate((int) $parts[2], (int) $parts[3], (int) $parts[1])) {
            $this->reject($line, 'enter a valid start date as YYYY-MM-DD.');
        }

        return new PlacementCsvRow(
            $registration, (int) $number, $student, strtolower($pathway), strtolower($session),
            strtolower($cohort), strtolower($level), $date,
        );
    }

    private function schoolId(?string $id): bool
    {
        return $id !== null && preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}\z/', $id) === 1;
    }

    private function reject(int $line, string $reason): never
    {
        throw ValidationException::withMessages(['file' => "Row $line: $reason"]);
    }
}
