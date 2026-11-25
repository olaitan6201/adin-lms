<?php

namespace App\Http\Controllers\ScormRuntime;

use App\Http\Requests\ScormRuntime\ImportReadingRequest;
use App\Models\Offering;
use App\Policies\LearningPolicy;
use App\Services\ScormRuntime\ReadingAttempts;
use App\Services\ScormRuntime\ReadingPackage;
use App\Services\ScormRuntime\StaticOrigin;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class ReadingController
{
    public function index(Request $request, Offering $offering, LearningPolicy $policy): Response
    {
        StaticOrigin::forRequest($request);
        $staff = $policy->audience($request->user(), $offering);
        $packages = DB::table('scorm_packages')->where('offering_id', $offering->id)->orderBy('title')->paginate(30, ['id', 'title']);

        return response()->view('scorm-runtime.index', compact('packages', 'staff', 'offering'))
            ->header('Cache-Control', 'no-store, private');
    }

    public function store(ImportReadingRequest $request, Offering $offering, ReadingPackage $reader): RedirectResponse
    {
        $lesson = $reader->lesson($request->file('package'));
        try {
            DB::table('scorm_packages')->insert(['id' => (string) Str::uuid7(), 'offering_id' => $offering->id,
                'title' => $request->validated('title'), 'lesson' => $lesson]);
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['title' => 'A reading with that title already exists.']);
        }

        return to_route('scorm.index', $offering);
    }

    public function launch(Request $request, Offering $offering, string $package, ReadingAttempts $attempts): Response
    {
        $origin = StaticOrigin::forRequest($request);
        $reading = $attempts->open($request, $offering, $package);
        $endpoint = route('scorm.save', [$offering, $package], false);

        $styleNonce = base64_encode(random_bytes(20));

        return response()->view('scorm-runtime.launch', compact('reading', 'origin', 'endpoint', 'offering', 'styleNonce'))
            ->header('Cache-Control', 'no-store, private')->header('Referrer-Policy', 'no-referrer')
            ->header('Content-Security-Policy', "default-src 'none'; style-src 'nonce-$styleNonce'; script-src 'self'; frame-src $origin; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
    }

    public function save(Request $request, Offering $offering, string $package, ReadingAttempts $attempts): Response
    {
        StaticOrigin::forRequest($request);
        $attempts->save($request, $offering, $package);

        return response()->noContent()->header('Cache-Control', 'no-store');
    }
}
