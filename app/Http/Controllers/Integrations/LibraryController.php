<?php

namespace App\Http\Controllers\Integrations;

use App\Models\Offering;
use App\Services\Integrations\LibraryProfiles;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class LibraryController
{
    public function index(Request $request, Offering $offering, LibraryProfiles $profiles): Response
    {
        $links = [];
        foreach ($profiles->forUser($request->user(), $offering) as $key => $entry) {
            $links[] = [
                'label' => $entry['label'],
                'host' => parse_url($entry['url'], PHP_URL_HOST),
                'href' => route('integrations.library', [$offering, $key]),
            ];
        }

        return Inertia::render('Integrations/Resources', [
            'course' => $offering->external_offering_id,
            'back' => route('courses.show', $offering),
            'links' => $links,
        ]);
    }

    public function open(Request $request, Offering $offering, string $profile, LibraryProfiles $profiles): RedirectResponse
    {
        $entry = $profiles->forUser($request->user(), $offering)[$profile] ?? null;
        abort_unless($entry, 404);

        return redirect()->away($entry['url'], 302, [
            'Cache-Control' => 'private, no-store',
            'Referrer-Policy' => 'no-referrer',
        ]);
    }
}
