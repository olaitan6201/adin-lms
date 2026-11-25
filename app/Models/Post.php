<?php

namespace App\Models;

use App\Enums\PostModerationState;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends DomainModel
{
    protected $table = 'posts';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'moderation_state' => PostModerationState::class,
            'posted_at' => 'immutable_datetime',
        ];
    }

    public function forum(): BelongsTo
    {
        return $this->belongsTo(Forum::class, 'forum_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'parent_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
