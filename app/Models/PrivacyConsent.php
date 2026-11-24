<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrivacyConsent extends DomainModel
{
    protected $table = 'privacy_consents';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'granted_at' => 'immutable_datetime',
            'withdrawn_at' => 'immutable_datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
