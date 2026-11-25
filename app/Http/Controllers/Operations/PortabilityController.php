<?php

namespace App\Http\Controllers\Operations;

use App\Enums\CoursePackageFormat;
use App\Http\Requests\Operations\ImportCoursePackageRequest;
use App\Models\Offering;
use App\Services\Operations\CourseTransfer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;

final class PortabilityController
{
    public function desk(): \Inertia\Response
    {
        return Inertia::render('CourseExchange', [
            'csrf' => csrf_token(),
            'uploadLimit' => min(9437184, UploadedFile::getMaxFilesize()),
            'offerings' => Offering::orderByDesc('id')->limit(100)->get(['id', 'external_offering_id', 'status']),
        ]);
    }

    public function import(ImportCoursePackageRequest $request, Offering $offering, CourseTransfer $transfer): JsonResponse
    {
        $count = $transfer->import($request->user(), $offering, $request->file('package')->getRealPath());

        return response()->json(['imported' => $count], 201);
    }

    public function export(Request $request, Offering $offering, CoursePackageFormat $format, CourseTransfer $transfer): Response
    {
        return response($transfer->export($request->user(), $offering, $format), 200, [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => 'attachment; filename="course-'.$format->value.'.zip"',
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
