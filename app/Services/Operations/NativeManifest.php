<?php

namespace App\Services\Operations;

use App\Enums\Learning\LessonKind;

final class NativeManifest
{
    public function decode(array $entries, ?\Closure $authorizeAssessment = null): array
    {
        $manifest = json_decode($entries['backup.json'], true, 20);
        unset($entries['backup.json']);
        $format = $manifest['format'] ?? null;
        $portable = $format === NativeMaterialReferences::FORMAT;
        $hasAssessment = $format === 'adin-course-3' || ($portable && array_key_exists('assessment', $manifest));
        if ($hasAssessment && $authorizeAssessment !== null) {
            $authorizeAssessment();
        }

        $this->fields($manifest, $hasAssessment ? ['format', 'lessons', 'forums', 'assessment'] : ['format', 'lessons', 'forums']);
        $this->boundedList($manifest['lessons'], 50);
        $this->boundedList($manifest['forums'], 50);
        if ($hasAssessment) {
            (new NativeAssessmentRules)->validate($manifest['assessment'], count($manifest['lessons']), $entries);
        } elseif ((! $portable && $format !== 'adin-course-2') || (! $manifest['lessons'] && ! $manifest['forums'])) {
            TextAssetArchive::reject('Expected a non-empty Adin course backup.');
        }

        foreach ($manifest['forums'] as $title) {
            $this->title($title);
        }

        foreach ($manifest['lessons'] as $lesson) {
            $this->fields($lesson, ['title', 'kind', 'body', 'materials']);
            $this->title($lesson['title']);
            $this->text($lesson['body']);
            if (! is_string($lesson['kind']) || ! LessonKind::tryFrom(preg_replace('/^draft:/', '', $lesson['kind']))) {
                TextAssetArchive::reject('Unsupported lesson kind.');
            }

            $this->boundedList($lesson['materials'], 20);
            foreach ($lesson['materials'] as $material) {
                $this->material($material, $entries, $portable);
            }
            NativeMaterialReferences::validate($lesson, $portable);
        }

        if ($entries) {
            TextAssetArchive::reject('Unexpected files in native backup.');
        }

        return $manifest;
    }

    private function material(mixed $row, array &$entries, bool $portable): void
    {
        $keys = ['title', 'body', 'transcript', 'url', 'attachment', 'download'];
        if ($portable) {
            $keys[] = 'ref';
        }
        $this->fields($row, $keys);
        $this->title($row['title']);
        $this->text($row['body']);
        $this->text($row['transcript']);
        if (! is_bool($row['download']) || ($row['attachment'] === null && $row['url'] === null && trim($row['body'] ?? '') === '')) {
            TextAssetArchive::reject('Incomplete material.');
        }

        $url = $row['url'];
        if ($url !== null && (! is_string($url) || strlen($url) > 2048 || ! filter_var($url, FILTER_VALIDATE_URL)
            || parse_url($url, PHP_URL_SCHEME) !== 'https' || parse_url($url, PHP_URL_USER) !== null || parse_url($url, PHP_URL_QUERY) !== null)) {
            TextAssetArchive::reject('Use HTTPS links without credentials or query parameters.');
        }

        $attachment = $row['attachment'];
        if ($attachment !== null) {
            PackageAttachments::consume($attachment, $entries);
        }
    }

    private function fields(mixed $row, array $keys): void
    {
        if (! is_array($row) || count($row) !== count($keys) || array_diff($keys, array_keys($row))) {
            TextAssetArchive::reject('Invalid or unknown backup fields.');
        }
    }

    private function boundedList(mixed $list, int $maximum): void
    {
        if (! is_array($list) || ! array_is_list($list) || count($list) > $maximum) {
            TextAssetArchive::reject('Invalid backup collection or too many records.');
        }
    }

    private function title(mixed $title): void
    {
        if (! is_string($title) || trim($title) === '' || mb_strlen($title) > 191 || preg_match('/[\x00-\x1f]/', $title)) {
            TextAssetArchive::reject('Invalid title.');
        }
    }

    private function text(mixed $text): void
    {
        if ($text !== null && (! is_string($text) || strlen($text) > 65535 || str_contains($text, "\0"))) {
            TextAssetArchive::reject('Invalid lesson or material text (64 KiB maximum).');
        }
    }
}
