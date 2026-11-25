<?php

namespace App\Services\Roster;

use DomainException;
use Generator;
use SimpleXMLElement;
use SplFileObject;
use ZipArchive;

class ProfileSheet
{
    public function rows(string $path, ?string $format = null): Generator
    {
        if (! is_file($path) || ! is_readable($path) || filesize($path) > 8_000_000) {
            throw new DomainException('Expected a readable local profile sheet under 8 MB.');
        }
        if (($format ?? strtolower(pathinfo($path, PATHINFO_EXTENSION))) === 'xlsx') {
            yield from $this->excel($path);

            return;
        }
        $file = new SplFileObject($path);
        while (! $file->eof()) {
            $row = $file->fgetcsv(',', '"', '');
            if ($row !== false && $row !== [null]) {
                yield $row;
            }
        }
    }

    private function excel(string $path): Generator
    {
        $zip = new ZipArchive;
        if ($zip->open($path, ZipArchive::RDONLY) !== true) {
            throw new DomainException('Invalid XLSX file.');
        }
        try {
            $strings = [];
            if ($zip->locateName('xl/sharedStrings.xml') !== false) {
                foreach ($this->xml($zip, 'xl/sharedStrings.xml')->si as $item) {
                    $strings[] = $this->text($item);
                }
            }
            $workbook = $this->xml($zip, 'xl/workbook.xml');
            if (count($workbook->sheets->sheet) !== 1) {
                throw new DomainException('Provide one profile worksheet per file.');
            }
            $sheet = $this->xml($zip, 'xl/worksheets/sheet1.xml');
            foreach ($sheet->sheetData->row as $line) {
                $row = [];
                foreach ($line->c as $cell) {
                    if (! preg_match('/^([A-I])[1-9]\d*$/D', (string) $cell['r'], $m) || isset($cell->f)) {
                        throw new DomainException('Expected literal values in columns A through I.');
                    }
                    $row[ord($m[1]) - 65] = match ((string) $cell['t']) {
                        's' => $strings[(int) $cell->v] ?? throw new DomainException('Invalid XLSX text index.'),
                        'inlineStr' => $this->text($cell->is),
                        default => (string) $cell->v,
                    };
                }
                if ($row !== []) {
                    yield array_replace(array_fill(0, max(array_keys($row)) + 1, ''), $row);
                }
            }
        } finally {
            $zip->close();
        }
    }

    private function text(SimpleXMLElement $item): string
    {
        return implode('', array_map('strval', $item->xpath('.//*[local-name()="t"]') ?: []));
    }

    private function xml(ZipArchive $zip, string $name): SimpleXMLElement
    {
        $bytes = $zip->getFromName($name, 8_000_001);
        if ($bytes === false || strlen($bytes) > 8_000_000 || str_contains($bytes, "\0") || stripos($bytes, '<!DOCTYPE') !== false) {
            throw new DomainException('Missing or unsupported XLSX component.');
        }
        $xml = @simplexml_load_string($bytes, options: LIBXML_NONET);

        return $xml !== false ? $xml : throw new DomainException('Malformed XLSX worksheet.');
    }
}
