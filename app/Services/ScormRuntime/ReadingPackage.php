<?php

namespace App\Services\ScormRuntime;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use ZipArchive;

final class ReadingPackage
{
    public function lesson(UploadedFile $file): string
    {
        $zip = new ZipArchive;
        if ($file->getSize() > 131072 || $zip->open($file->getRealPath(), ZipArchive::CHECKCONS | ZipArchive::RDONLY) !== true) {
            $this->reject();
        }
        try {
            $files = ['imsmanifest.xml' => 'scorm-profile/imsmanifest.xml', 'reading.html' => 'scorm-static/reading.html',
                'reading.js' => 'scorm-static/reading.js', 'lesson.txt' => null];
            if ($zip->numFiles !== count($files)) {
                $this->reject();
            }
            $lesson = '';
            foreach ($files as $name => $trusted) {
                $stat = $zip->statName($name);
                if (! $stat || $stat['size'] > 32768 || $stat['size'] < 1 || $stat['encryption_method'] !== 0
                    || ! $zip->getExternalAttributesIndex($stat['index'], $os, $attr)
                    || ($os === ZipArchive::OPSYS_UNIX && ! in_array(($attr >> 16) & 0170000, [0, 0100000], true))) {
                    $this->reject();
                }
                $bytes = $zip->getFromIndex($stat['index'], 32769);
                if ($bytes === false || strlen($bytes) !== $stat['size']) {
                    $this->reject();
                }
                if ($trusted !== null) {
                    if ($bytes !== file_get_contents(resource_path($trusted))) {
                        $this->reject();
                    }
                } else {
                    if (trim($bytes) === '' || ! mb_check_encoding($bytes, 'UTF-8') || preg_match('/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/', $bytes)) {
                        $this->reject();
                    }
                    $lesson = $bytes;
                }
            }

            return $lesson;
        } finally {
            $zip->close();
        }
    }

    private function reject(): never
    {
        throw ValidationException::withMessages(['package' => 'Expected an unmodified Reading v1 SCO and a UTF-8 lesson of at most 32 KiB.']);
    }
}
