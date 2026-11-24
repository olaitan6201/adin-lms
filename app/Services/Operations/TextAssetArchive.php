<?php

namespace App\Services\Operations;

use Illuminate\Validation\ValidationException;
use ZipArchive;

final class TextAssetArchive
{
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
                if (! $zip->getExternalAttributesIndex($i, $system, $attributes)
                    || ($system === ZipArchive::OPSYS_UNIX && ! in_array(($attributes >> 16) & 0170000, [0, 0100000], true))) {
                    self::reject('Only regular archive files are supported.');
                }
                if (! preg_match('~^(imsmanifest\.xml|course\.json|[a-z0-9_-]{1,64}\.txt)$~D', $name)
                    || isset($entries[$name]) || $stat['size'] > 65535 || $stat['encryption_method'] !== 0
                    || ($bytes += $stat['size']) > 524288) {
                    self::reject('Invalid asset name, size, encryption or duplicate entry.');
                }
                $text = $zip->getFromIndex($i, 65536);
                if ($text === false || strlen($text) !== $stat['size'] || ! mb_check_encoding($text, 'UTF-8')
                    || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', $text)) {
                    self::reject('Every asset must be plain UTF-8 text.');
                }
                $entries[$name] = $text;
            }

            return $entries;
        } finally {
            $zip->close();
        }
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
