<?php

namespace App\Services\Roster;

use DomainException;

class ProfilePhotograph
{
    public function normalise(string $input, int $record): string
    {
        $error = new DomainException("Record {$record}: photo must be a JPEG data URL under 256 KiB and at most 1024 × 1024 pixels.");
        $prefix = 'data:image/jpeg;base64,';
        if (! str_starts_with($input, $prefix) || strlen($input) > 350000) {
            throw $error;
        }
        $bytes = base64_decode(substr($input, strlen($prefix)), true);
        $size = $bytes ? @getimagesizefromstring($bytes) : false;
        if (! $size || strlen($bytes) > 262144 || $size[2] !== IMAGETYPE_JPEG || max($size[0], $size[1]) > 1024) {
            throw $error;
        }
        $image = @imagecreatefromstring($bytes);
        if (! $image) {
            throw $error;
        }
        ob_start();
        try {
            if (! imagejpeg($image, null, 80)) {
                throw $error;
            }

            return base64_encode(ob_get_contents());
        } finally {
            ob_end_clean();
        }
    }
}
