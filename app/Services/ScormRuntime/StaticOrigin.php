<?php

namespace App\Services\ScormRuntime;

use Illuminate\Http\Request;

final class StaticOrigin
{
    public static function forRequest(Request $request): string
    {
        $origin = config('scorm_runtime.origin');
        $app = config('app.url');
        abort_unless(is_string($origin) && $app === $request->getSchemeAndHttpHost(), 404);
        if (app()->environment('testing') && preg_match('~^http://127\.0\.0\.1:[1-9][0-9]{0,4}$~D', $app)
            && preg_match('~^http://localhost:[1-9][0-9]{0,4}$~D', $origin)) {
            return $origin;
        }
        // Different allowlisted public TLDs are sufficient without a mutable public suffix list.
        $pattern = '~^https://(?:[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(com|org|net|edu|gov|uk|ng)$~D';
        abort_unless(preg_match($pattern, $app, $lms) && preg_match($pattern, $origin, $static)
            && $lms[1] !== $static[1], 404);

        return $origin;
    }
}
