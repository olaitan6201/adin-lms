<?php

namespace App\Http\Controllers\Operations;

use App\Enums\AuthenticationOutcome;
use App\Enums\DeliveryStatus;
use App\Enums\OperationsEvent;
use App\Http\Requests\Operations\BackupEvidenceRequest;
use App\Http\Requests\Operations\ChangeRetentionRequest;
use App\Http\Requests\Operations\InfrastructureRequest;
use App\Models\AuthSession;
use App\Models\LoginEvent;
use App\Models\NotificationDelivery;
use App\Services\Operations\ConsentRegister;
use App\Services\Operations\InfrastructureDesk;
use App\Services\Operations\OperationsAudit;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class OperationsController
{
    public function index(ConsentRegister $register, InfrastructureDesk $desk): Response
    {
        return Inertia::render('Operations', [
            'activeSessions' => AuthSession::whereNull('revoked_at')->where('expires_at', '>', now())->count(),
            'failedDeliveries' => NotificationDelivery::where('status', DeliveryStatus::Failed)->count(),
            'failedLogins' => LoginEvent::whereIn('outcome', [
                AuthenticationOutcome::PasswordFailed,
                AuthenticationOutcome::ChallengeFailed,
            ])->where('occurred_at', '>=', now()->subDay())->count(),
            'retentionDays' => $register->days(),
            'infrastructure' => $desk->snapshot(),
        ]);
    }

    public function configure(InfrastructureRequest $request, InfrastructureDesk $desk): RedirectResponse
    {
        $desk->configure($request->user(), [
            'storage_mib' => $request->integer('storage_mib'), 'probe_ms' => $request->integer('probe_ms'),
            'bridge_slot' => $request->validated('bridge_slot'),
        ]);

        return to_route('operations.index');
    }

    public function backup(BackupEvidenceRequest $request): RedirectResponse
    {
        OperationsAudit::record($request->user(), OperationsEvent::BackupEvidence, $request->validated('reference'), [
            'outcome' => $request->validated('outcome'),
        ]);

        return to_route('operations.index');
    }

    public function retention(ChangeRetentionRequest $request, ConsentRegister $register): RedirectResponse
    {
        $register->setDays($request->user(), $request->integer('days'));

        return to_route('operations.index');
    }
}
