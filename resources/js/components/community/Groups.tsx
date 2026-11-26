import { useState } from 'react';
import { Action, Badge, Card, Table } from '@/components/workspace/Elements';
import { discussionGroups, groupPosts } from './engagementFixtures';
import { Drawer, Field } from '@/components/workspace/EngagementControls';

export function Groups({ student }: { student: boolean }) {
    const [groups, setGroups] = useState(discussionGroups);
    const [posts, setPosts] = useState(groupPosts);
    const [active, setActive] = useState(groups[0].id);
    const [adding, setAdding] = useState(false);
    const group = groups.find(g => g.id === active)!;
    const items = posts.filter(p => p.group === group.name);
    return <div className="space-y-5">
        <Card title="Groups" subtitle="Course groups, their members and the space each one works in"
            actions={<><Badge>{groups.length} groups</Badge>{!student && <Action variant="primary" size="sm" icon="plus" onClick={() => setAdding(true)}>Create group</Action>}</>}>
            <Table columns={['Group','Members','Posts','Files','Last activity','']} rows={groups.map(g => [
                <span><strong>{g.name}</strong><small className="block">{g.course}</small></span>, `${g.members.length} members`, g.posts, g.sharedFiles, g.lastActivity,
                <Action size="sm" onClick={() => setActive(g.id)}>Open</Action>,
            ])}/>
        </Card>
        <Card title={group.name} subtitle={`${group.course} · ${group.members.length} members · private to the group and the teaching staff`} bodyClassName="p-0">
            <div className="grid divide-y lg:grid-cols-[2fr_1fr] lg:divide-x lg:divide-y-0">
                <div>{items.map(p => <article key={p.id} className="border-b p-4 text-sm">
                    <strong>{p.author}</strong> {p.role === 'Lecturer' && <Badge>Lecturer</Badge>} <small>{p.time}</small>
                    {p.replyTo && <p className="mt-1 text-xs text-ink-500">In reply to: {p.replyTo}</p>}<p className="mt-2">{p.body}</p>
                </article>)}{!items.length && <p className="p-4 text-sm">No posts to display.</p>}
                    <form key={group.id} className="space-y-2 p-4" onSubmit={e => {
                        e.preventDefault();
                        const body = String(new FormData(e.currentTarget).get('post')).trim();
                        if (!body) return;
                        setPosts([...posts, { id: crypto.randomUUID(), group: group.name, author: 'You', role: 'Member', time: 'Just now', body, replyTo: null }]);
                        setGroups(groups.map(g => g === group ? { ...g, posts: g.posts + 1, lastActivity: 'You posted just now' } : g));
                        e.currentTarget.reset();
                    }}>
                        <textarea className="input min-h-20 w-full" name="post" aria-label="Write to your group" required placeholder="Write to your group"/>
                        <div className="flex items-center justify-between gap-3"><small>Visible to group members and the teaching staff.</small><button className="btn btn-primary btn-sm">Post</button></div>
                    </form>
                </div>
                <aside className="space-y-4 p-4 text-sm"><strong>Members</strong><ul>{group.members.map(m => <li key={m} className="py-1">{m}</li>)}</ul>
                    <div className="border-t pt-3"><strong>Group task</strong><p>{group.task}</p><small>{group.due && `Due ${group.due}`}</small></div>
                    <div className="border-t pt-3"><strong>Shared files</strong>{group.id === 'g-1' ?
                        <ul>{['Consolidation working draft v3.pdf','Examiner handover note.docx','Trial balance extract.xlsx','Group presentation outline.pptx'].map(name => <li className="py-1" key={name}>{name}</li>)}</ul>
                        : <p>{group.sharedFiles} shared files</p>}</div>
                </aside>
            </div>
        </Card>
        {adding && <Drawer title="Create group" close={() => setAdding(false)}><form className="space-y-4" onSubmit={e => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            const id = crypto.randomUUID();
            const name = String(d.get('name')).trim();
            if (groups.some(g => g.name === name)) {
                const input = e.currentTarget.elements.namedItem('name') as HTMLInputElement;
                input.setCustomValidity('Choose a different group name.');
                input.reportValidity();
                return;
            }
            setGroups([...groups,{ id, name, course: String(d.get('course')), members: ['You'], posts: 0, sharedFiles: 0, task: String(d.get('task')), due: '', lastActivity: 'Created just now' }]);
            setActive(id);
            setAdding(false);
        }}>
            <Field label="Group name"><input name="name" className="input" required pattern=".*\S.*" onInput={e => e.currentTarget.setCustomValidity('')}/></Field>
            <Field label="Course"><select name="course" className="select">{[...new Set(groups.map(g => g.course))].map(c => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Group task"><textarea name="task" className="input" required/></Field><button className="btn btn-primary">Create group</button>
        </form></Drawer>}
    </div>;
}
