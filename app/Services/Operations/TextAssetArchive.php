<?php

namespace App\Services\Operations;

use Illuminate\Validation\ValidationException;
use ZipArchive;

final class TextAssetArchive
{
    public const MAX_TOTAL_BYTES = 524288;

    private const MAX_ENTRY_BYTES = 65535;

    public static function reject(string $message): never
    {
        throw ValidationException::withMessages(['package' => $message]);
    }

    /** @return array<string,string> */
    public static function read(string $path): array
    {
        $zip = new ZipArchive;
        if (filesize($path) > 1048576 || $zip->open($path, ZipArchive::CHECKCONS | ZipArchive::RDONLY) !== true) {
            self::reject('Expected a ZIP of at most 1 MiB.');
        }

        try {
            if ($zip->numFiles > 51) {
                self::reject('At most 50 assets plus a manifest are supported.');
            }

            $entries = [];
            $bytes = 0;
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $stat = $zip->statIndex($i);
                $name = $stat['name'];
                $bytes += $stat['size'];
                if (! self::isRegularFile($zip, $i)) {
                    self::reject('Only regular archive files are supported.');
                }

                if (! preg_match('~^(imsmanifest\.xml|course\.json|[a-z0-9_-]{1,64}\.txt)$~D', $name)
                    || isset($entries[$name]) || $stat['size'] > self::MAX_ENTRY_BYTES || $stat['encryption_method'] !== 0
                    || $bytes > self::MAX_TOTAL_BYTES) {
                    self::reject('Invalid asset name, size, encryption or duplicate entry.');
                }

                $entries[$name] = self::readText($zip, $i, $stat['size']);
            }

            return $entries;
        } finally {
            $zip->close();
        }
    }

    private static function isRegularFile(ZipArchive $zip, int $index): bool
    {
        if (! $zip->getExternalAttributesIndex($index, $system, $attributes)) {
            return false;
        }

        $unixType = ($attributes >> 16) & 0170000;

        return $system !== ZipArchive::OPSYS_UNIX || in_array($unixType, [0, 0100000], true);
    }

    private static function readText(ZipArchive $zip, int $index, int $expectedBytes): string
    {
        $text = $zip->getFromIndex($index, self::MAX_ENTRY_BYTES + 1);
        if ($text === false || strlen($text) !== $expectedBytes || ! mb_check_encoding($text, 'UTF-8')
            || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', $text)) {
            self::reject('Every asset must be plain UTF-8 text.');
        }

        return $text;
    }

    /** @param array<string,string> $entries */
    public static function write(array $entries): string
    {
        $file = tmpfile();
        try {
            $path = stream_get_meta_data($file)['uri'];
            $zip = new ZipArchive;
            abort_unless($zip->open($path, ZipArchive::OVERWRITE) === true, 500);
            foreach ($entries as $name => $text) {
                abort_unless($zip->addFromString($name, $text), 500);
            }

            abort_unless($zip->close(), 500);
            self::read($path);

            return file_get_contents($path);
        } finally {
            fclose($file);
        }
    }
}
