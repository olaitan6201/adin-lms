<?php

namespace App\Http\Controllers\Community;

use App\Http\Requests\Community\CommunityBodyRequest;
use App\Models\Announcement;
use App\Models\Forum;
use App\Models\Offering;
use App\Models\PrivateMessage;
use App\Models\StudyGroup;
use App\Services\Community\CommunityAudience;
use App\Services\Community\CommunityBoard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BoardController
{
    public function __construct(private CommunityAudience $audience) {}

    public function show(Request $request, Offering $offering, CommunityBoard $board): Response
    {
        $members = $this->audience->members($offering->id);
        abort_unless((clone $members)->whereKey($request->user()->id)->exists(), 403);
        $teacher = $this->audience->teachers($offering->id)->whereKey($request->user()->id)->exists();

        return Inertia::render('Community/Board', ['offering' => $offering->only('id', 'external_offering_id'), 'canManage' => $teacher,
            'forums' => Forum::where('offering_id', $offering->id)->get()->filter(fn (Forum $f) => $request->user()->can('view', $f))->values()->map->only(['id', 'title']),
            'groups' => $teacher ? StudyGroup::where('offering_id', $offering->id)->get(['id', 'name']) : [],
            'members' => $members->where('id', '!=', $request->user()->id)->orderBy('full_name')->get(['id', 'full_name']),
            'announcements' => $board->announcements($offering->id)]);
    }

    public function forum(Request $request, Offering $offering): RedirectResponse
    {
        abort_unless($this->audience->teachers($offering->id)->whereKey($request->user()->id)->exists(), 403);
        $data = $request->validate(['title' => ['required', 'string', 'max:191'], 'group_id' => ['nullable', 'uuid', Rule::exists('study_groups', 'id')->where('offering_id', $offering->id)]]);
        Forum::forceCreate($data + ['offering_id' => $offering->id]);

        return back();
    }

    public function announce(CommunityBodyRequest $request, Offering $offering): RedirectResponse
    {
        abort_unless($this->audience->teachers($offering->id)->whereKey($request->user()->id)->exists(), 403);
        Announcement::forceCreate(['offering_id' => $offering->id, 'author_id' => $request->user()->id, 'body' => $request->validated('body'), 'published_at' => now()]);

        return back();
    }

    public function message(CommunityBodyRequest $request, Offering $offering): RedirectResponse
    {
        $members = $this->audience->members($offering->id);
        abort_unless((clone $members)->whereKey($request->user()->id)->exists(), 403);
        $recipient = $request->validate(['recipient_id' => ['required', 'uuid']])['recipient_id'];
        abort_unless($members->whereKey($recipient)->exists() && $recipient !== $request->user()->id, 403);
        PrivateMessage::forceCreate(['sender_id' => $request->user()->id, 'recipient_id' => $recipient, 'body' => $request->validated('body'), 'sent_at' => now()]);

        return back();
    }
}
