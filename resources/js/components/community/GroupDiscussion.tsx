import { type FormEvent } from 'react';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import type { Group, GroupPost } from '@/types/community/communication';

type Props = { group: Group; items: GroupPost[]; postToGroup: (event: FormEvent<HTMLFormElement>) => void };
export function GroupDiscussion({ group, items, postToGroup }: Props) {
    return (
        <Card
            title={group.name}
            subtitle={`${group.course} · ${group.members.length} members · private to the group and the teaching staff`}
            bodyClassName="p-0"
        >
            <div className="grid divide-y lg:grid-cols-[2fr_1fr] lg:divide-x lg:divide-y-0">
                <div>
                    {items.map((p) => (
                        <article key={p.id} className="border-b p-4 text-sm">
                            <strong>{p.author}</strong> {p.role === 'Lecturer' && <Badge>Lecturer</Badge>}{' '}
                            <small>{p.time}</small>
                            {p.replyTo && <p className="mt-1 text-xs text-ink-500">In reply to: {p.replyTo}</p>}
                            <p className="mt-2">{p.body}</p>
                        </article>
                    ))}
                    {!items.length && <p className="p-4 text-sm">No posts to display.</p>}
                    <form key={group.id} className="space-y-2 p-4" onSubmit={postToGroup}>
                        <textarea
                            className="input min-h-20 w-full"
                            name="post"
                            aria-label="Write to your group"
                            required
                            placeholder="Write to your group"
                        />
                        <div className="flex items-center justify-between gap-3">
                            <small>Visible to group members and the teaching staff.</small>
                            <button className="btn btn-primary btn-sm">Post</button>
                        </div>
                    </form>
                </div>
                <aside className="space-y-4 p-4 text-sm">
                    <strong>Members</strong>
                    <ul>
                        {group.members.map((m) => (
                            <li key={m} className="py-1">
                                {m}
                            </li>
                        ))}
                    </ul>
                    <div className="border-t pt-3">
                        <strong>Group task</strong>
                        <p>{group.task}</p>
                        <small>{group.due && `Due ${group.due}`}</small>
                    </div>
                    <div className="border-t pt-3">
                        <strong>Shared files</strong>
                        {group.files?.length ? (
                            <ul>
                                {group.files.map((name) => (
                                    <li className="py-1" key={name}>
                                        {name}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>{group.sharedFiles} shared files</p>
                        )}
                    </div>
                </aside>
            </div>
        </Card>
    );
}
