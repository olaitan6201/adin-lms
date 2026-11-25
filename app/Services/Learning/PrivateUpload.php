<?php

namespace App\Services\Learning;

use App\Models\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class PrivateUpload
{
    public const VALIDATED = 'validated';

    public const DIRECTORY = 'learning';

    public function __construct(private ResourceFileFormat $format) {}

    public function store(UploadedFile $upload, bool $caption = false): File
    {
        $mime = $caption ? $this->format->captionMime($upload) : $this->format->validatedMime($upload);
        $key = self::DIRECTORY.'/'.Str::uuid7();
        $file = new File;
        $file
            ->forceFill([
                'object_key' => $key,
                'filename' => $upload->getClientOriginalName(),
                'media_type' => $mime,
                'size_bytes' => $upload->getSize(),
                'checksum' => hash_file('sha256', $upload->getRealPath()),
                'validation_status' => self::VALIDATED,
            ])
            ->save();
        throw_unless(
            Storage::disk('local')->putFileAs(self::DIRECTORY, $upload, basename($key), 'private'),
            \RuntimeException::class,
            'Private storage write failed.',
        );

        return $file;
    }
}
