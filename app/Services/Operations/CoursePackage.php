<?php

namespace App\Services\Operations;

use Illuminate\Support\Facades\Validator;
use JsonException;

final class CoursePackage
{
    /** @return list<array{title:string,body:string,links:array}> */
    public function unpack(array $entries): array
    {
        if (isset($entries['imsmanifest.xml'])) {
            $chapters = (new ScormReader)->chapters($entries['imsmanifest.xml']);
            unset($entries['imsmanifest.xml']);
        } else {
            try {
                $manifest = json_decode($entries['course.json'] ?? '', true, 16, JSON_THROW_ON_ERROR);
            } catch (JsonException) {
                TextAssetArchive::reject('Expected a SCORM manifest or native course.json.');
            }
            if (($manifest['format'] ?? null) !== 'adin-text-1' || count($manifest) !== 2) {
                TextAssetArchive::reject('Unsupported native format.');
            }
            $chapters = $manifest['chapters'] ?? null;
            unset($entries['course.json']);
        }
        if (! is_array($chapters) || count($chapters) > 50) {
            TextAssetArchive::reject('Expected at most 50 chapters.');
        }
        foreach ($chapters as $chapter) {
            if (! is_array($chapter) || ! is_array($chapter['links'] ?? null) || count($chapter['links']) > 10) {
                TextAssetArchive::reject('Expected at most ten links per chapter.');
            }
        }
        $validator = Validator::make(['chapters' => $chapters], [
            'chapters' => 'required|array|list|min:1|max:50', 'chapters.*' => 'required|array:title,file,links',
            'chapters.*.title' => 'required|string|max:191', 'chapters.*.file' => ['required', 'string', 'regex:/^[a-z0-9_-]{1,64}\.txt$/D'],
            'chapters.*.links' => 'present|array|list|max:10', 'chapters.*.links.*' => 'array:title,url',
            'chapters.*.links.*.title' => 'required|string|max:191', 'chapters.*.links.*.url' => 'required|string|url:https|max:2048',
        ]);
        if ($validator->fails()) {
            TextAssetArchive::reject('Invalid chapter title, text asset or HTTPS link.');
        }
        $rows = [];
        foreach ($chapters as $chapter) {
            $file = $chapter['file'];
            if (! isset($entries[$file])) {
                TextAssetArchive::reject('Missing or repeated text asset.');
            }
            foreach ($chapter['links'] as $link) {
                if (parse_url($link['url'], PHP_URL_USER) !== null || parse_url($link['url'], PHP_URL_QUERY) !== null) {
                    TextAssetArchive::reject('Links with credentials or query parameters are not portable.');
                }
            }
            $rows[] = ['title' => $chapter['title'], 'body' => $entries[$file], 'links' => $chapter['links']];
            unset($entries[$file]);
        }
        if ($entries) {
            TextAssetArchive::reject('Undeclared or unsupported package entries.');
        }

        return $rows;
    }
}
