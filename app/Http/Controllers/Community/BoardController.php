<?php

namespace App\Http\Controllers\Community;

use App\Http\Requests\Community\CommunityBodyRequest;
use App\Http\Requests\Community\CreateForumRequest;
use App\Http\Requests\Community\SendMessageRequest;
use App\Models\Announcement;
use App\Models\Enrolment;
use App\Models\Forum;
use App\Models\Offering;
use App\Models\PrivateMessage;
use App\Models\StudyGroup;
use App\Services\Community\CommunityAudience;
use App\Services\Community\CommunityBoard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        return Inertia::render('Community/Board', [
            'offering' => $offering->only('id', 'external_offering_id'),
            'canManage' => $teacher,
            'forums' => Forum::where('offering_id', $offering->id)
                ->get()
                ->filter(fn (Forum $f) => $request->user()->can('view', $f))
                ->values()
                ->map->only(['id', 'title']),
            'groups' => $teacher ? StudyGroup::with('members:id,group_id,enrolment_id')
                ->where('offering_id', $offering->id)->orderBy('name')->get(['id', 'name']) : [],
            'registrations' => $teacher ? Enrolment::with('student.user:id,full_name')
                ->where('offering_id', $offering->id)->where('status', 'registered')->get()->map(fn ($row) => [
                    'id' => $row->id, 'label' => $row->student->user?->full_name ?? $row->student->external_student_id,
                ]) : [],
            'members' => $members
                ->where('id', '!=', $request->user()->id)
                ->orderBy('full_name')
                ->get(['id', 'full_name']),
            'announcements' => $board->announcements($offering->id),
        ]);
    }

    public function forum(CreateForumRequest $request, Offering $offering): RedirectResponse
    {
        Forum::forceCreate($request->validated() + ['offering_id' => $offering->id]);

        return back();
    }

    public function announce(CommunityBodyRequest $request, Offering $offering): RedirectResponse
    {
        abort_unless($this->audience->teachers($offering->id)->whereKey($request->user()->id)->exists(), 403);
        DB::transaction(fn () => Announcement::forceCreate([
            'offering_id' => $offering->id,
            'author_id' => $request->user()->id,
            'body' => $request->body(),
            'published_at' => now(),
        ]));

        return back();
    }

    public function message(SendMessageRequest $request, Offering $offering): RedirectResponse
    {
        $members = $this->audience->members($offering->id);
        abort_unless((clone $members)->whereKey($request->user()->id)->exists(), 403);
        $recipient = $request->recipientId();
        abort_unless($members->whereKey($recipient)->exists() && $recipient !== $request->user()->id, 403);
        PrivateMessage::forceCreate([
            'sender_id' => $request->user()->id,
            'recipient_id' => $recipient,
            'body' => $request->body(),
            'sent_at' => now(),
        ]);

        return back();
    }
}
