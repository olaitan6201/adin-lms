<?php

namespace App\Http\Controllers\Community;

use App\Http\Requests\Community\CommunityBodyRequest;
use App\Http\Resources\Community\DiscussionPostResource;
use App\Models\Forum;
use App\Models\Post;
use App\Services\Community\CommunityBoard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiscussionController
{
    public function show(Request $request, Forum $forum): Response
    {
        return Inertia::render('Community/Discussion', ['forum' => $forum->only('id', 'title', 'offering_id'),
            'canModerate' => $request->user()->can('moderate', $forum),
            'posts' => DiscussionPostResource::collection(Post::with('author:id,full_name')->where('forum_id', $forum->id)->where('moderation_state', 'visible')->orderBy('posted_at')->orderBy('id')
                ->get(['id', 'body', 'parent_id', 'author_id', 'posted_at']))->resolve($request)]);
    }

    public function store(CommunityBodyRequest $request, Forum $forum, CommunityBoard $board): RedirectResponse
    {
        $board->post($request->user(), $forum, $request->validated('body'), $request->validated('parent_id'));

        return back();
    }

    public function hide(Request $request, Forum $forum, string $post, CommunityBoard $board): RedirectResponse
    {
        $board->hide($request->user(), $forum, $post);

        return back();
    }
}
