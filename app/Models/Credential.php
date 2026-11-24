<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Credential extends DomainModel
{
    protected $table = 'credentials';

    public $timestamps = false;

    protected $hidden = ['protected_value', 'lookup_digest'];

    protected static function booted(): void
    {
        static::saving(function (self $credential): void {
            if ($credential->isDirty('protected_value')) {
                $credential->lookup_digest = hash('sha256', $credential->protected_value);
            }
        });
    }

    protected function casts(): array
    {
        return [
            'expires_at' => 'immutable_datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
