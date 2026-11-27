<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\Admin\StructureRegisterImportRequest;
use App\Http\Resources\Admin\StructureImportPreviewResource;
use App\Services\Academics\StructureRegisterImportWorkflow;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

final class StructureRegisterImportController
{
    private const array PRIVATE_HEADERS = ['Cache-Control' => 'private, no-store'];

    public function __construct(private StructureRegisterImportWorkflow $workflow) {}

    public function template(): StreamedResponse
    {
        return response()->streamDownload(
            $this->workflow->writeTemplate(...),
            'academic-structure-register-template.csv',
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );
    }

    public function columns(StructureRegisterImportRequest $request): JsonResponse
    {
        return response()->json(['headers' => $this->workflow->columns($request->validated('file'))], headers: self::PRIVATE_HEADERS);
    }

    public function preview(StructureRegisterImportRequest $request): JsonResponse
    {
        $plan = $this->workflow->preview(
            $request->validated('file'),
            $request->validated('columns'),
            $request->user(),
            $request->session()->token(),
        );

        return (new StructureImportPreviewResource($plan))->response()->withHeaders(self::PRIVATE_HEADERS);
    }

    public function store(StructureRegisterImportRequest $request): JsonResponse
    {
        $created = $this->workflow->commit(
            $request->validated('file'),
            $request->validated('columns'),
            $request->user(),
            $request->session()->token(),
            $request->validated('confirmation'),
        );

        return response()->json(['created' => $created], headers: self::PRIVATE_HEADERS);
    }
}
