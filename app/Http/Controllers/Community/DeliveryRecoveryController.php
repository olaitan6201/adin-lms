<?php

namespace App\Http\Controllers\Community;

use App\Enums\CommunityAuditAction;
use App\Enums\DeliveryStatus;
use App\Enums\NotificationChannel;
use App\Enums\PermissionCode;
use App\Models\AuditLog;
use App\Models\NotificationDelivery;
use App\Services\Authority\ScopedAuthority;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class DeliveryRecoveryController
{
    public function __construct(private ScopedAuthority $authority) {}

    public function index(Request $request): Response
    {
        $this->authorize($request);
        $failed = NotificationDelivery::where('status', DeliveryStatus::Failed)
            ->where('channel', NotificationChannel::Email)
            ->orderBy('id')->simplePaginate(25, ['id', 'attempt_count', 'last_error_code']);

        return Inertia::render('Community/DeliveryRecovery', ['failed' => $failed]);
    }

    public function retry(Request $request, string $delivery): RedirectResponse
    {
        $this->authorize($request);
        DB::transaction(function () use ($request, $delivery): void {
            $row = NotificationDelivery::where('channel', NotificationChannel::Email)
                ->lockForUpdate()->findOrFail($delivery);
            if ($row->status !== DeliveryStatus::Failed) {
                return;
            }

            AuditLog::forceCreate([
                'actor_id' => $request->user()->id,
                'subject_key' => $row->id,
                'action' => CommunityAuditAction::DeliveryRetried->value,
                'occurred_at' => now(),
                'details' => ['attempts' => $row->attempt_count, 'failure' => $row->last_error_code],
            ]);
            $row->forceFill([
                'status' => DeliveryStatus::Pending,
                'attempt_count' => 0,
                'last_error_code' => null,
                'next_attempt_at' => now(),
            ])->save();
        });

        return back();
    }

    private function authorize(Request $request): void
    {
        abort_unless($this->authority->institutionAllows($request->user(), PermissionCode::OperationsManage), 403);
    }
}
