<?php

namespace App\Http\Controllers\Operations;

use App\Http\Requests\Operations\BrandingRequest;
use App\Services\Operations\InstitutionBranding;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;

final class BrandingController
{
    public function update(BrandingRequest $request, InstitutionBranding $branding): RedirectResponse
    {
        $branding->change($request->user(), $request->validated('institution'), $request->file('logo'), $request->boolean('restore_logo'));

        return to_route('operations.index');
    }

    public function image(string $id, InstitutionBranding $branding): Response
    {
        return response($branding->image($id), 200, ['Content-Type' => 'image/png', 'X-Content-Type-Options' => 'nosniff']);
    }
}
