<?php

namespace App\Http\Controllers\Operations;

use App\Enums\PrivacyCaseKind;
use App\Enums\PrivacyCaseStage;
use App\Http\Requests\Operations\AdvanceCaseRequest;
use App\Http\Requests\Operations\OpenCaseRequest;
use App\Models\PrivacyCaseFile;
use App\Services\Operations\CaseRegister;
use Illuminate\Http\RedirectResponse;

final class PrivacyCaseFileController
{
    public function store(OpenCaseRequest $request, CaseRegister $cases): RedirectResponse
    {
        $cases->open($request->user(), PrivacyCaseKind::from($request->validated('kind')),
            $request->validated('reference'), $request->validated('subject_id'));

        return to_route('operations.privacy');
    }

    public function advance(AdvanceCaseRequest $request, PrivacyCaseFile $case, CaseRegister $cases): RedirectResponse
    {
        $cases->advance($request->user(), $case, PrivacyCaseStage::from($request->validated('stage')), $request->validated('reference'));

        return to_route('operations.privacy');
    }
}
