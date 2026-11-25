<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use App\Enums\NotificationChannel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationDelivery extends DomainModel
{
    protected $table = 'notification_deliveries';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'channel' => NotificationChannel::class,
            'status' => DeliveryStatus::class,
            'attempt_count' => 'integer',
            'next_attempt_at' => 'immutable_datetime',
            'delivered_at' => 'immutable_datetime',
        ];
    }

    /** @return Builder<self> */
    public static function dueEmails(): Builder
    {
        return self::where('channel', NotificationChannel::Email)
            ->where('status', DeliveryStatus::Pending)
            ->where('next_attempt_at', '<=', now());
    }

    public function notification(): BelongsTo
    {
        return $this->belongsTo(Notification::class, 'notification_id');
    }
}
