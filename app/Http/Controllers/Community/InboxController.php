<?php

namespace App\Http\Controllers\Community;

use App\Enums\PermissionCode;
use App\Http\Requests\Community\CommunityBodyRequest;
use App\Http\Requests\Community\UpdateReadStateRequest;
use App\Http\Resources\Community\PrivateMessageResource;
use App\Models\Announcement;
use App\Models\Notification;
use App\Models\PrivateMessage;
use App\Services\Authority\ScopedAuthority;
use App\Services\Community\CommunityBoard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InboxController
{
    public function index(Request $request, CommunityBoard $board, ScopedAuthority $authority): Response
    {
        $user = $request->user();

        return Inertia::render('Community/Inbox', [
            'notices' => Notification::where('recipient_id', $user->id)
                ->latest('created_at')
                ->get(['id', 'body', 'read_at']),
            'messages' => PrivateMessageResource::collection(
                PrivateMessage::with(['sender:id,full_name', 'recipient:id,full_name'])
                    ->where('sender_id', $user->id)
                    ->orWhere('recipient_id', $user->id)
                    ->latest('sent_at')
                    ->get(['id', 'sender_id', 'recipient_id', 'body']),
            )->resolve($request),
            'announcements' => $board->announcements(null),
            'canAnnounce' => $authority->institutionAllows($user, PermissionCode::AccountsManage),
        ]);
    }

    public function announce(CommunityBodyRequest $request, ScopedAuthority $authority): RedirectResponse
    {
        abort_unless($authority->institutionAllows($request->user(), PermissionCode::AccountsManage), 403);
        DB::transaction(fn () => Announcement::forceCreate([
            'author_id' => $request->user()->id,
            'body' => $request->body(),
            'published_at' => now(),
        ]));

        return back();
    }

    public function readState(UpdateReadStateRequest $request, string $notice): RedirectResponse
    {
        $row = Notification::where('recipient_id', $request->user()->id)->findOrFail($notice);
        $row->read_at = $request->boolean('read') ? $row->read_at ?? now() : null;
        $row->save();

        return back();
    }
}
