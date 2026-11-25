<?php

namespace App\Http\Controllers\Operations;

use App\Enums\AuthenticationOutcome;
use App\Enums\DeliveryStatus;
use App\Http\Requests\Operations\ChangeRetentionRequest;
use App\Models\AuthSession;
use App\Models\LoginEvent;
use App\Models\NotificationDelivery;
use App\Services\Operations\ConsentRegister;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

final class OperationsController
{
    public function index(ConsentRegister $register): Response
    {
        return Inertia::render('Operations', [
            'activeSessions' => AuthSession::whereNull('revoked_at')->where('expires_at', '>', now())->count(),
            'failedDeliveries' => NotificationDelivery::where('status', DeliveryStatus::Failed)->count(),
            'failedLogins' => LoginEvent::whereIn('outcome', [
                AuthenticationOutcome::PasswordFailed,
                AuthenticationOutcome::ChallengeFailed,
            ])->where('occurred_at', '>=', now()->subDay())->count(),
            'retentionDays' => $register->days(),
        ]);
    }

    public function retention(ChangeRetentionRequest $request, ConsentRegister $register): RedirectResponse
    {
        $register->setDays($request->user(), $request->integer('days'));

        return to_route('operations.index');
    }
}
