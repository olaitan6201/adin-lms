<?php

namespace App\Services\Operations;

use App\Enums\CoursePackageFormat;
use Illuminate\Support\Facades\Validator;
use JsonException;

final class CoursePackage
{
    public const NATIVE_VERSION = 'adin-text-1';

    /** @return list<PortableChapter> */
    public function unpack(array $entries): array
    {
        $format = isset($entries[CoursePackageFormat::Scorm->manifestName()]) ? CoursePackageFormat::Scorm : CoursePackageFormat::Native;
        $manifest = $entries[$format->manifestName()] ?? '';
        unset($entries[$format->manifestName()]);

        $chapters = match ($format) {
            CoursePackageFormat::Scorm => (new ScormReader)->chapters($manifest),
            CoursePackageFormat::Native => $this->nativeChapters($manifest),
        };
        $this->validateChapters($chapters);

        $rows = [];
        foreach ($chapters as $chapter) {
            $file = $chapter['file'];
            if (! isset($entries[$file])) {
                TextAssetArchive::reject('Missing or repeated text asset.');
            }

            $this->validateLinks($chapter['links']);
            $rows[] = new PortableChapter($chapter['title'], $entries[$file], $chapter['links']);
            unset($entries[$file]);
        }

        if ($entries) {
            TextAssetArchive::reject('Undeclared or unsupported package entries.');
        }

        return $rows;
    }

    private function nativeChapters(string $json): mixed
    {
        try {
            $manifest = json_decode($json, true, 16, JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            TextAssetArchive::reject('Expected a SCORM manifest or native course.json.');
        }

        if (($manifest['format'] ?? null) !== self::NATIVE_VERSION || count($manifest) !== 2) {
            TextAssetArchive::reject('Unsupported native format.');
        }

        return $manifest['chapters'] ?? null;
    }

    private function validateChapters(mixed $chapters): void
    {
        if (! is_array($chapters) || count($chapters) > 50) {
            TextAssetArchive::reject('Expected at most 50 chapters.');
        }

        foreach ($chapters as $chapter) {
            if (! is_array($chapter) || ! is_array($chapter['links'] ?? null) || count($chapter['links']) > 10) {
                TextAssetArchive::reject('Expected at most ten links per chapter.');
            }
        }

        $validator = Validator::make(['chapters' => $chapters], [
            'chapters' => 'required|array|list|min:1|max:50',
            'chapters.*' => 'required|array:title,file,links',
            'chapters.*.title' => 'required|string|max:191',
            'chapters.*.file' => ['required', 'string', 'regex:~^(?:[a-zA-Z0-9_-]{1,64}/){0,3}[a-zA-Z0-9_-]{1,64}\.txt$~D'],
            'chapters.*.links' => 'present|array|list|max:10',
            'chapters.*.links.*' => 'array:title,url',
            'chapters.*.links.*.title' => 'required|string|max:191',
            'chapters.*.links.*.url' => 'required|string|url:https|max:2048',
        ]);
        if ($validator->fails()) {
            TextAssetArchive::reject('Invalid chapter title, text asset or HTTPS link.');
        }
    }

    /** @param list<array{title:string,url:string}> $links */
    private function validateLinks(array $links): void
    {
        foreach ($links as $link) {
            if (parse_url($link['url'], PHP_URL_USER) !== null || parse_url($link['url'], PHP_URL_QUERY) !== null) {
                TextAssetArchive::reject('Links with credentials or query parameters are not portable.');
            }
        }
    }
}
