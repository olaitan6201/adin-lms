<?php

namespace App\Services\Community;

use App\Enums\CommunityAuditAction;
use App\Enums\PostModerationState;
use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\Forum;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CommunityBoard
{
    public function post(User $user, Forum $forum, string $body, ?string $parent): void
    {
        if (
            $parent !== null &&
            ! Post::where('forum_id', $forum->id)
                ->where('moderation_state', PostModerationState::Visible)
                ->whereKey($parent)
                ->exists()
        ) {
            throw ValidationException::withMessages([
                'parent_id' => 'Choose a visible post in this discussion.',
            ]);
        }

        Post::forceCreate([
            'forum_id' => $forum->id,
            'author_id' => $user->id,
            'parent_id' => $parent,
            'body' => $body,
            'moderation_state' => PostModerationState::Visible,
            'posted_at' => now(),
        ]);
    }

    public function hide(User $user, Forum $forum, string $post): void
    {
        DB::transaction(function () use ($user, $forum, $post): void {
            $row = Post::where('forum_id', $forum->id)->lockForUpdate()->findOrFail($post);
            if ($row->moderation_state !== PostModerationState::Hidden) {
                $row->moderation_state = PostModerationState::Hidden;
                $row->save();
                AuditLog::forceCreate([
                    'actor_id' => $user->id,
                    'action' => CommunityAuditAction::PostHidden->value,
                    'subject_key' => 'post:'.$post,
                    'occurred_at' => now(),
                ]);
            }
        });
    }

    public function announcements(?string $offering): Collection
    {
        return Announcement::where('offering_id', $offering)
            ->where('published_at', '<=', now())
            ->latest('published_at')
            ->get(['id', 'body', 'published_at']);
    }
}
