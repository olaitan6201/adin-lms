<?php

namespace App\Services\Learning;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use ZipArchive;

final class ResourceFileFormat
{
    public const INLINE_IMAGES = ['image/png', 'image/jpeg', 'image/webp'];

    public const INLINE_MEDIA = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/webm', 'video/mp4', 'video/webm'];

    public function captionMime(UploadedFile $upload): string
    {
        $text = $upload->getContent();
        if (strtolower($upload->getClientOriginalExtension()) !== 'vtt' ||
            ! mb_check_encoding($text, 'UTF-8') ||
            ! preg_match('/\A(?:\xEF\xBB\xBF)?WEBVTT[ \t]*\R\R/', $text) ||
            ! preg_match('/^(?:\d{2,}:)?\d{2}:\d{2}\.\d{3} --> (?:\d{2,}:)?\d{2}:\d{2}\.\d{3}/m', $text) ||
            preg_match('~[\x00-\x1f\x7f/\\\\]~', $upload->getClientOriginalName()) ||
            mb_strlen($upload->getClientOriginalName()) > 191) {
            throw ValidationException::withMessages(['caption' => 'Upload a UTF-8 WebVTT file with timestamped captions.']);
        }

        return 'text/vtt';
    }

    private const TYPES = [
        'pdf' => 'application/pdf',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'webp' => 'image/webp',
        'mp3' => 'audio/mpeg',
        'mp4' => 'video/mp4',
        'wav' => 'audio/x-wav,audio/wav',
        'webm' => 'video/webm,audio/webm',
        'zip' => 'application/zip',
        'doc' => 'application/msword',
        'xls' => 'application/vnd.ms-excel',
        'ppt' => 'application/vnd.ms-powerpoint',
    ];

    public function validatedMime(UploadedFile $upload): string
    {
        $ext = strtolower($upload->getClientOriginalExtension());
        $mime = new \finfo(FILEINFO_MIME_TYPE)->file($upload->getRealPath());
        $valid = in_array($mime, explode(',', self::TYPES[$ext] ?? ''), true);
        if (in_array($ext, ['docx', 'xlsx', 'pptx'], true)) {
            $archive = new ZipArchive;
            if ($archive->open($upload->getRealPath(), ZipArchive::RDONLY) === true) {
                $part = [
                    'docx' => 'word/document.xml',
                    'xlsx' => 'xl/workbook.xml',
                    'pptx' => 'ppt/presentation.xml',
                ][$ext];
                $valid =
                    $archive->locateName('[Content_Types].xml') !== false &&
                    $archive->locateName($part) !== false;
                $archive->close();
            }
        }

        if (
            in_array(
                $ext,
                ['txt', 'csv', 'py', 'c', 'cpp', 'java', 'js', 'ts', 'css', 'json', 'sql'],
                true,
            )
        ) {
            $valid =
                str_starts_with($mime ?? '', 'text/') ||
                $mime === 'application/json' ||
                $mime === 'application/javascript';
        }

        $name = $upload->getClientOriginalName();
        if (! $valid || mb_strlen($name) > 191 || preg_match('~[\x00-\x1f\x7f/\\\\]~', $name)) {
            throw ValidationException::withMessages([
                'file' => 'Choose a supported file with a matching format and a safe filename.',
            ]);
        }

        return $mime;
    }
}
