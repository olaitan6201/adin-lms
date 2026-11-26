import { useState, type FormEvent } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Group, GroupPost } from '@/types/community/communication';
import { GroupEditor } from './GroupEditor';
import { availableCourses } from './communityCourses';

export function Groups({
    student,
    discussionGroups,
    groupPosts,
}: {
    discussionGroups: Group[];
    groupPosts: GroupPost[];
    student: boolean;
}) {
    const [groups, setGroups] = useState(discussionGroups);
    const [posts, setPosts] = useState(groupPosts);
    const [active, setActive] = useState(groups[0]?.id);
    const [adding, setAdding] = useState(false);
    const group = groups.find((g) => g.id === active);
    const items = posts.filter((p) => p.group === group?.name);
    const courses = availableCourses(discussionGroups);
    function postToGroup(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!group) return;
        const body = String(new FormData(e.currentTarget).get('post')).trim();
        if (!body) return;
        setPosts([
            ...posts,
            { id: crypto.randomUUID(), group: group.name, author: 'You', role: 'Member', time: 'Just now', body, replyTo: null },
        ]);
        setGroups(groups.map((g) => (g === group ? { ...g, posts: g.posts + 1, lastActivity: 'You posted just now' } : g)));
        e.currentTarget.reset();
    }

    function createGroup(created: Group) {
        setGroups((current) => [...current, created]);
        setActive(created.id);
        setAdding(false);
    }

    return (
        <div className="space-y-5">
            <Card
                title="Groups"
                subtitle="Course groups, their members and the space each one works in"
                actions={
                    <>
                        <Badge>{groups.length} groups</Badge>
                        {!student && (
                            <Action variant="primary" size="sm" icon="plus" disabled={!courses.length} onClick={() => setAdding(true)}>
                                Create group
                            </Action>
                        )}
                    </>
                }
            >
                {!student && !courses.length && <p>No courses available for group creation.</p>}
                <Table
                    columns={['Group', 'Members', 'Posts', 'Files', 'Last activity', '']}
                    rows={groups.map((g) => [
                        <span>
                            <strong>{g.name}</strong>
                            <small className="block">{g.course}</small>
                        </span>,
                        `${g.members.length} members`,
                        g.posts,
                        g.sharedFiles,
                        g.lastActivity,
                        <Action size="sm" onClick={() => setActive(g.id)}>
                            Open
                        </Action>,
                    ])}
                />
            </Card>
            {group && (
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
            )}
            {adding && <GroupEditor groups={groups} courses={courses} create={createGroup} close={() => setAdding(false)} />}
        </div>
    );
}
