<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\StructureImportRequest;
use App\Http\Resources\Admin\StructureImportPreviewResource;
use App\Services\Academics\StructureImportWorkflow;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class StructureImportController
{
    public function __construct(private StructureImportWorkflow $workflow) {}

    public function template(): StreamedResponse
    {
        return response()->streamDownload(
            $this->workflow->writeTemplate(...),
            'academic-structure-template.csv',
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );
    }

    public function columns(StructureImportRequest $request): JsonResponse
    {
        $headers = $this->workflow->columns($request->validated('file'));

        return response()->json(['headers' => $headers], headers: ['Cache-Control' => 'private, no-store']);
    }

    public function preview(StructureImportRequest $request): JsonResponse
    {
        $preview = $this->workflow->preview(
            $request->validated('file'),
            $request->validated('columns'),
            $request->user(),
            $request->session()->token(),
        );

        $resource = new StructureImportPreviewResource($preview);

        return $resource->response()
            ->header('Cache-Control', 'private, no-store');
    }

    public function store(StructureImportRequest $request): JsonResponse
    {
        $created = $this->workflow->commit(
            $request->validated('file'),
            $request->validated('columns'),
            $request->user(),
            $request->session()->token(),
            $request->validated('confirmation'),
        );

        return response()->json(['created' => $created]);
    }
}
