import { GroupDiscussion } from './GroupDiscussion';
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
    const [{ groups, posts }, setDiscussion] = useState({ groups: discussionGroups, posts: groupPosts });
    const [active, setActive] = useState(groups[0]?.id);
    const [adding, setAdding] = useState(false);
    const group = groups.find((g) => g.id === active);
    const items = posts.filter((p) => p.group === group?.name);
    const courses = availableCourses(discussionGroups);
    function postToGroup(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!group) {
            return;
        }

        const body = String(new FormData(e.currentTarget).get('post')).trim();
        if (!body) {
            return;
        }

        const post: GroupPost = {
            id: crypto.randomUUID(),
            group: group.name,
            author: 'You',
            role: 'Member',
            time: 'Just now',
            body,
            replyTo: null,
        };
        setDiscussion((current) => ({
            posts: [...current.posts, post],
            groups: current.groups.map((item) =>
                item.id === group.id ? { ...item, posts: item.posts + 1, lastActivity: 'You posted just now' } : item,
            ),
        }));
        e.currentTarget.reset();
    }

    function createGroup(created: Group) {
        setDiscussion((current) => ({ ...current, groups: [...current.groups, created] }));
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
                            <Action
                                variant="primary"
                                size="sm"
                                icon="plus"
                                disabled={!courses.length}
                                onClick={() => setAdding(true)}
                            >
                                Create group
                            </Action>
                        )}
                    </>
                }
            >
                {!student && !courses.length && <p>No courses available for group creation.</p>}
                <Table
                    rowKeys={groups.map((group) => group.id)}
                    columns={['Group', 'Members', 'Posts', 'Files', 'Last activity', '']}
                    rows={groups.map((g) => [
                        <span key="group">
                            <strong>{g.name}</strong>
                            <small className="block">{g.course}</small>
                        </span>,
                        `${g.members.length} members`,
                        g.posts,
                        g.sharedFiles,
                        g.lastActivity,
                        <Action key="actions" size="sm" onClick={() => setActive(g.id)}>
                            Open
                        </Action>,
                    ])}
                />
            </Card>
            {group && <GroupDiscussion {...{ group, items, postToGroup }} />}
            {adding && (
                <GroupEditor
                    groups={groups}
                    courses={courses}
                    create={createGroup}
                    close={() => setAdding(false)}
                />
            )}
        </div>
    );
}
