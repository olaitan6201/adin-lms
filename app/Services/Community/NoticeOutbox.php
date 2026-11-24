<?php

namespace App\Services\Community;

use App\Models\Notification;
use App\Models\NotificationDelivery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class NoticeOutbox
{
    public function record(Builder $audience, string $key, string $body): void
    {
        foreach ($audience->select('id')->lazyById(200) as $recipient) {
            $identity = ['recipient_id' => $recipient->id, 'event_key' => $key];
            if (Notification::where($identity)->exists()) {
                continue;
            }
            DB::transaction(function () use ($identity, $body): void {
                $id = (string) Str::uuid7();
                Notification::upsert([$identity + ['id' => $id, 'body' => $body, 'created_at' => now()]], ['recipient_id', 'event_key'], ['event_key']);
                if (Notification::whereKey($id)->lockForUpdate()->first(['id']) !== null) {
                    NotificationDelivery::forceCreate(['notification_id' => $id, 'channel' => 'email', 'status' => 'pending', 'next_attempt_at' => now()]);
                }
            });
        }
    }
}
