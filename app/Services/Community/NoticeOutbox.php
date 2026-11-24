<?php

namespace App\Services\Community;

use App\Models\Notification;
use App\Models\NotificationDelivery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

final class NoticeOutbox
{
    public function record(Builder $audience, string $key, string $body): void
    {
        foreach ($audience->select('id')->lazyById(200) as $recipient) {
            DB::transaction(function () use ($recipient, $key, $body): void {
                $notice = Notification::unguarded(fn () => Notification::firstOrCreate(['recipient_id' => $recipient->id, 'event_key' => $key], ['body' => $body, 'created_at' => now()]));
                if ($notice->wasRecentlyCreated) {
                    NotificationDelivery::forceCreate(['notification_id' => $notice->id, 'channel' => 'email', 'status' => 'pending', 'next_attempt_at' => now()]);
                }
            });
        }
    }
}
