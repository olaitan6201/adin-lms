<?php

final class MigrationFiles
{
    /** @param array<string,string> $expected Reviewed SHA-256 digests keyed by migration-relative path. */
    public static function verify(string $root, array $expected): string
    {
        $files = [];
        foreach (['', 'baseline/'] as $prefix) {
            $directory = rtrim($root.'/'.$prefix, '/');
            if (is_link($directory) || ! is_dir($directory)) {
                throw new RuntimeException('Unreviewed target migration layout.');
            }

            foreach (new FilesystemIterator($directory) as $entry) {
                $path = $prefix.$entry->getFilename();
                if ($path === 'baseline' && ! $entry->isLink() && $entry->isDir()) {
                    continue;
                }
                if ($entry->isLink() || ! $entry->isFile() || ! isset($expected[$path])) {
                    throw new RuntimeException('Unreviewed target migration layout.');
                }
                $files[$path] = hash_file('sha256', $entry->getPathname());
            }
        }
        ksort($files, SORT_STRING);
        ksort($expected, SORT_STRING);
        if ($files !== $expected) {
            throw new RuntimeException('Unreviewed target migration revision.');
        }

        return hash('sha256', json_encode($files, JSON_THROW_ON_ERROR));
    }
}
