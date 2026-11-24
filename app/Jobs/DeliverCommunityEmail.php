<?php

namespace App\Jobs;

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

    public function __construct(public readonly string $deliveryId) {}

    public int $uniqueFor = 3600;

    public function uniqueId(): string
    {
        return $this->deliveryId;
    }

    public function handle(): void
    {
        DB::transaction(function (): void {
            $delivery = NotificationDelivery::where('channel', 'email')->where('status', 'pending')->where('next_attempt_at', '<=', now())
                ->lockForUpdate()->find($this->deliveryId);
            if ($delivery === null) {
                return;
            }
            $recipient = $delivery->notification->recipient;
            $delivery->next_attempt_at = null;
            if ($recipient->status !== 'active') {
                $delivery->status = 'cancelled';
            } else {
                $delivery->attempt_count++;
                try {
                    Mail::to($recipient->email)->send(new CommunityNoticeMail);
                    $delivery->status = 'delivered';
                    $delivery->delivered_at = now();
                    $delivery->last_error_code = null;
                } catch (Exception) {
                    $delivery->last_error_code = 'mail_transport_failed';
                    if ($delivery->attempt_count >= 5) {
                        $delivery->status = 'failed';
                    } else {
                        $delivery->next_attempt_at = now()->addMinutes(2 ** ($delivery->attempt_count - 1));
                    }
                }
            }
            $delivery->save();
        });
    }
}
