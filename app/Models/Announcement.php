<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends DomainModel
{
    protected $table = 'announcements';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'published_at' => 'immutable_datetime',
        ];
    }

    public function offering(): BelongsTo
    {
        return $this->belongsTo(Offering::class, 'offering_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
