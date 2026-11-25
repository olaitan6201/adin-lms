<?php

namespace App\Services\Assessment;

use App\Models\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PrivateScripts
{
    private const DIRECTORY = 'assessments';

    private const VALIDATED = 'validated';

    public function store(UploadedFile $upload): File
    {
        $key = $upload->store(self::DIRECTORY, 'local');
        abort_unless($key, 503);

        return File::forceCreate([
            'object_key' => $key,
            'filename' => mb_substr(
                preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($upload->getClientOriginalName())),
                0,
                191,
            ),
            'media_type' => $upload->getMimeType(),
            'size_bytes' => $upload->getSize(),
            'checksum' => hash_file('sha256', $upload->getRealPath()),
            'validation_status' => self::VALIDATED,
        ]);
    }

    public function download(File $file): StreamedResponse
    {
        abort_unless(
            str_starts_with($file->object_key, self::DIRECTORY.'/') && $file->validation_status === self::VALIDATED,
            404,
        );

        return Storage::disk('local')->download($file->object_key, $file->filename, [
            'Content-Type' => 'application/octet-stream',
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
