<?php

namespace App\Services\Operations;

use App\Models\File;
use App\Services\Assessment\PrivateScripts;
use App\Services\Learning\PrivateUpload;
use App\Services\Learning\ResourceFileFormat;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

final class PackageAttachments
{
    public static function validateName(mixed $name): void
    {
        if (! is_string($name) || ! preg_match('~^[\pL\pN][\pL\pN _().-]{0,175}\.(?:pdf|png|jpe?g|txt)$~iuD', $name)) {
            TextAssetArchive::reject('Attachments must be named PDF, PNG, JPEG or plain text files.');
        }
    }

    public static function export(File $file, array &$entries, bool $reference = false): array
    {
        self::validateName($file->filename);
        $pattern = $reference ? '~^assessments/[a-zA-Z0-9_-]+\.(?:pdf|txt)$~iD' : '~^learning/[a-zA-Z0-9_-]+$~D';
        if (! preg_match($pattern, $file->object_key) || $file->validation_status !== PrivateUpload::VALIDATED
            || $file->size_bytes > 4194304 || count($entries) >= 50) {
            TextAssetArchive::reject('Only validated private learning files up to 4 MiB can be backed up.');
        }

        $stream = Storage::disk('local')->readStream($file->object_key);
        if (! is_resource($stream)) {
            TextAssetArchive::reject('The source attachment is unavailable.');
        }

        try {
            $bytes = stream_get_contents($stream, 4194305);
        } finally {
            fclose($stream);
        }

        if ($bytes === false || strlen($bytes) !== (int) $file->size_bytes || hash('sha256', $bytes) !== $file->checksum
            || strlen($bytes) + array_sum(array_map('strlen', $entries)) > TextAssetArchive::MAX_TOTAL_BYTES) {
            TextAssetArchive::reject('Attachment integrity or package size check failed.');
        }

        $asset = 'asset-'.(count($entries) + 1).'.bin';
        $entries[$asset] = $bytes;

        return ['asset' => $asset, 'name' => $file->filename, 'sha256' => $file->checksum];
    }

    public static function consume(mixed $attachment, array &$entries, bool $reference = false): void
    {
        NativeRules::fields($attachment, ['name', 'asset', 'sha256']);
        self::validateName($attachment['name']);
        $asset = $attachment['asset'];
        NativeRules::check(is_string($asset) && preg_match('/^asset-[1-9][0-9]?\.bin$/D', $asset) && isset($entries[$asset])
            && hash('sha256', $entries[$asset]) === $attachment['sha256'], 'Missing, repeated or corrupt attachment.');
        if ($reference) {
            NativeRules::check((bool) preg_match('/\.(pdf|txt)$/iD', $attachment['name']), 'Assignment references must be PDF or text.');
        }

        self::withUpload($attachment, $entries[$asset], fn ($upload) => app(ResourceFileFormat::class)->validatedMime($upload));
        unset($entries[$asset]);
    }

    public static function restore(array $attachment, string $bytes, bool $reference = false): File
    {
        return self::withUpload($attachment, $bytes, fn ($upload) => $reference
            ? app(PrivateScripts::class)->store($upload) : app(PrivateUpload::class)->store($upload));
    }

    private static function withUpload(array $attachment, string $bytes, callable $callback): mixed
    {
        $temp = tmpfile();
        try {
            abort_unless(fwrite($temp, $bytes) === strlen($bytes), 503);
            $upload = new UploadedFile(stream_get_meta_data($temp)['uri'], $attachment['name'], test: true);

            return $callback($upload);
        } finally {
            fclose($temp);
        }
    }
}
