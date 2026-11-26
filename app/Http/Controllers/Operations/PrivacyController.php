<?php

namespace App\Http\Controllers\Operations;

use App\Enums\OperationsEvent;
use App\Enums\PrivacyOperation;
use App\Http\Requests\Operations\ApprovePrivacyCaseRequest;
use App\Http\Requests\Operations\CaseReferenceRequest;
use App\Http\Requests\Operations\ChangeConsentRequest;
use App\Http\Resources\Operations\CaseFileResource;
use App\Models\PrivacyCaseFile;
use App\Models\PrivacyConsent;
use App\Models\User;
use App\Services\Operations\ConsentRegister;
use App\Services\Operations\OperationsAudit;
use App\Services\Operations\PrivacyCases;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class PrivacyController
{
    public function show(Request $request): Response
    {
        return Inertia::render('Operations/Consent', [
            'notice' => ConsentRegister::NOTICE,
            'granted' => PrivacyConsent::where('user_id', $request->user()->id)->where('purpose', ConsentRegister::PURPOSE)
                ->where('notice_version', ConsentRegister::NOTICE)->whereNull('withdrawn_at')->exists(),
        ]);
    }

    public function desk(): Response
    {
        return Inertia::render('Operations/Privacy', [
            'csrf' => csrf_token(),
            'cases' => CaseFileResource::collection(PrivacyCaseFile::with('receipts')->orderByDesc('updated_at')->orderByDesc('id')->simplePaginate(15)),
            'operations' => [
                ['value' => PrivacyOperation::Export->value, 'label' => 'Export account and consent'],
                ['value' => PrivacyOperation::RegistrationExtract->value, 'label' => 'Extract subject registrations for a verified access case'],
                ['value' => PrivacyOperation::Purge->value, 'label' => 'Delete eligible withdrawn feedback consents'],
            ],
        ]);
    }

    public function incident(CaseReferenceRequest $request): JsonResponse
    {
        $event = OperationsAudit::record($request->user(), OperationsEvent::IncidentReferred, $request->validated('reference'));

        return response()->json(['audit' => $event->id], 201);
    }

    public function consent(ChangeConsentRequest $request, ConsentRegister $register): JsonResponse|RedirectResponse
    {
        $register->change($request->user(), $request->boolean('grant'));

        return $request->expectsJson() ? response()->json(['granted' => $request->boolean('grant')]) : to_route('operations.consent.show');
    }

    public function approve(ApprovePrivacyCaseRequest $request, User $subject, PrivacyCases $cases): JsonResponse
    {
        $approval = $cases->approve(
            $request->user(),
            $subject,
            PrivacyOperation::from($request->validated('operation')),
            $request->validated('reference'),
        );

        return response()->json(['approval' => $approval->id], 201);
    }

    public function execute(CaseReferenceRequest $request, User $subject, string $approval, PrivacyCases $cases): JsonResponse
    {
        $result = $cases->execute($request->user(), $subject, $approval, $request->validated('reference'));

        return response()->json($result, 200, ['Cache-Control' => 'private, no-store']);
    }
}
