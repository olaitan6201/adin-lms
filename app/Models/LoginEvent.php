<?php

namespace App\Models;

use App\Enums\AuthenticationOutcome;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginEvent extends DomainModel
{
    protected $table = 'login_events';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'occurred_at' => 'immutable_datetime',
            'outcome' => AuthenticationOutcome::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
