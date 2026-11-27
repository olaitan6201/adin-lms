<?php

namespace App\Http\Controllers\Admin;

use App\Http\Resources\Admin\QualityEvidenceResource;
use App\Services\Academics\QualityEvidence;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class QualityController
{
    public function __invoke(Request $request, QualityEvidence $evidence): Response
    {
        $resource = new QualityEvidenceResource($evidence->catalogue());

        return Inertia::render('Admin/Quality', $resource->resolve($request));
    }
}
