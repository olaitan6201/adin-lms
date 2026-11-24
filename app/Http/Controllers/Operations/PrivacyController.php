<?php

namespace App\Http\Controllers\Operations;

use App\Http\Requests\OperationsInput;
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
        return Inertia::render('OperationsConsent', [
            'granted' => PrivacyConsent::where('user_id', $request->user()->id)->where('purpose', ConsentRegister::PURPOSE)
                ->where('notice_version', ConsentRegister::NOTICE)->whereNull('withdrawn_at')->exists(),
        ]);
    }

    public function desk(): Response
    {
        return Inertia::render('PrivacyDesk', ['csrf' => csrf_token()]);
    }

    public function incident(OperationsInput $request): JsonResponse
    {
        $event = OperationsAudit::record($request->user(), 'privacy.incident_referred', $request->validated('reference'));

        return response()->json(['audit' => $event->id], 201);
    }

    public function consent(OperationsInput $request, ConsentRegister $register): JsonResponse|RedirectResponse
    {
        $register->change($request->user(), $request->boolean('grant'));

        return $request->expectsJson() ? response()->json(['granted' => $request->boolean('grant')]) : to_route('operations.consent.show');
    }

    public function approve(OperationsInput $request, User $subject, PrivacyCases $cases): JsonResponse
    {
        $approval = $cases->approve($request->user(), $subject, $request->validated('operation'), $request->validated('reference'));

        return response()->json(['approval' => $approval->id], 201);
    }

    public function execute(Request $request, User $subject, string $approval, PrivacyCases $cases): JsonResponse
    {
        return response()->json($cases->execute($request->user(), $subject, $approval), 200, ['Cache-Control' => 'private, no-store']);
    }
}
