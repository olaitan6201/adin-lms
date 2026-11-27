<?php

namespace App\Jobs;

use App\Enums\AccountStatus;
use App\Enums\DeliveryStatus;
use App\Mail\CommunityNoticeMail;
use App\Models\NotificationDelivery;
use Exception;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class DeliverCommunityEmail implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    private const MAX_ATTEMPTS = 5;

    public int $uniqueFor = 3600;

    public function __construct(public readonly string $deliveryId) {}

    public function uniqueId(): string
    {
        return $this->deliveryId;
    }

    public function handle(): void
    {
        DB::transaction(function (): void {
            $delivery = NotificationDelivery::dueEmails()->lockForUpdate()->find($this->deliveryId);
            if ($delivery === null) {
                return;
            }

            $recipient = $delivery->notification->recipient;
            $delivery->next_attempt_at = null;
            if ($recipient->status === AccountStatus::Active) {
                $this->attempt($delivery, $recipient->email);
            } else {
                $delivery->status = DeliveryStatus::Cancelled;
            }

            $delivery->save();
        });
    }

    private function attempt(NotificationDelivery $delivery, string $address): void
    {
        $delivery->attempt_count++;
        try {
            Mail::to($address)->send(new CommunityNoticeMail);
        } catch (Exception) {
            $this->recordFailure($delivery);

            return;
        }

        $delivery->status = DeliveryStatus::Delivered;
        $delivery->delivered_at = now();
        $delivery->last_error_code = null;
    }

    private function recordFailure(NotificationDelivery $delivery): void
    {
        $delivery->last_error_code = 'mail_transport_failed';
        if ($delivery->attempt_count >= self::MAX_ATTEMPTS) {
            $delivery->status = DeliveryStatus::Failed;

            return;
        }

        $delayMinutes = 2 ** ($delivery->attempt_count - 1);
        $delivery->next_attempt_at = now()->addMinutes($delayMinutes);
    }
}
