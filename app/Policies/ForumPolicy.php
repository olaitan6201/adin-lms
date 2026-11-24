<?php

namespace App\Policies;

use App\Models\Forum;
use App\Models\User;
use App\Services\Community\CommunityAudience;

class ForumPolicy
{
    public function __construct(private CommunityAudience $audience) {}

    public function view(User $user, Forum $forum): bool
    {
        return $this->moderate($user, $forum) || $this->audience->learners($forum->offering_id, $forum->group_id)->whereKey($user->id)->exists();
    }

    public function moderate(User $user, Forum $forum): bool
    {
        return $this->audience->teachers($forum->offering_id)->whereKey($user->id)->exists();
    }
}
