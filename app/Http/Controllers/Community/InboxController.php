<?php

namespace App\Http\Controllers\Community;

use App\Http\Requests\Community\CommunityBodyRequest;
use App\Http\Resources\Community\PrivateMessageResource;
use App\Models\Announcement;
use App\Models\Notification;
use App\Models\PrivateMessage;
use App\Services\Authority\ScopedAuthority;
use App\Services\Community\CommunityBoard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InboxController
{
    public function index(Request $request, CommunityBoard $board, ScopedAuthority $authority): Response
    {
        $user = $request->user();

        return Inertia::render('Community/Inbox', ['notices' => Notification::where('recipient_id', $user->id)->latest('created_at')->get(['id', 'body', 'read_at']),
            'messages' => PrivateMessageResource::collection(PrivateMessage::with(['sender:id,full_name', 'recipient:id,full_name'])->where('sender_id', $user->id)->orWhere('recipient_id', $user->id)
                ->latest('sent_at')->get(['id', 'sender_id', 'recipient_id', 'body']))->resolve($request),
            'announcements' => $board->announcements(null), 'canAnnounce' => $authority->institutionAllows($user, 'accounts.manage')]);
    }

    public function announce(CommunityBodyRequest $request, ScopedAuthority $authority): RedirectResponse
    {
        abort_unless($authority->institutionAllows($request->user(), 'accounts.manage'), 403);
        Announcement::forceCreate(['author_id' => $request->user()->id, 'body' => $request->validated('body'), 'published_at' => now()]);

        return back();
    }

    public function readState(Request $request, string $notice): RedirectResponse
    {
        $row = Notification::where('recipient_id', $request->user()->id)->findOrFail($notice);
        $request->validate(['read' => ['required', 'boolean']]);
        $row->read_at = $request->boolean('read') ? ($row->read_at ?? now()) : null;
        $row->save();

        return back();
    }
}
