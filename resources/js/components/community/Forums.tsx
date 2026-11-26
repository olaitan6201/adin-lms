import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Forum, Thread } from '@/types/community/communication';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { Field } from '@/components/ui/controls/Field';

export function Forums({ student, forums, threads }: { forums: Forum[]; threads: Thread[]; student: boolean }) {
    const [list, setList] = useState(forums);
    const [topics, setTopics] = useState(threads);
    const [selected, setSelected] = useState('');
    const topic = topics.find(t => t.id === selected);
    const forum = list.find(f => f.id === selected);
    const close = () => setSelected('');
    return <div className="space-y-5">
        <Card className="[&_th:last-child]:w-[110px]" title="Forums" subtitle="Course forums with moderated threads, peer and group discussion"
            actions={<Action size="sm" icon="plus" variant="primary" onClick={() => setSelected('new')}>New forum</Action>}>
            <Table columns={['Forum','Threads','Posts','Last activity','']} rows={list.map(f => [
                <div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate font-medium text-ink-800">{f.title}</p>{f.pinned && <Badge tone="amber">Pinned</Badge>}</div><p className="truncate text-[11.5px] text-ink-400">{f.course}</p></div>,
                f.threads, f.posts, <span className="text-[12.5px] text-ink-500">{f.last}</span>, <div className="flex justify-end"><Action size="sm" onClick={() => setSelected(topics.find(t => t.forum === f.id)?.id ?? f.id)}>Moderate</Action></div>,
            ])}/>
        </Card>
        <Card className="[&_th:last-child]:w-[90px]" title="Recent threads" subtitle="Threads needing moderation or a lecturer response" actions={<Badge tone="amber">{topics.filter(t => !t.responses.length).length} need review</Badge>}>
            <Table columns={['Thread','Author','Replies','Updated','']} rows={topics.map(t => [
                <div className="min-w-0"><p className="truncate font-medium text-ink-800">{t.title} {t.pinned && <Badge>Pinned</Badge>}</p><p className="truncate text-[11.5px] text-ink-400">{t.tag}</p></div>,
                t.author, t.replies, <span className="text-[12.5px] text-ink-500">{t.updated}</span>, <div className="flex justify-end"><Action size="sm" onClick={() => setSelected(t.id)}>Open</Action></div>,
            ])}/>
        </Card>
        {selected === 'new' && <Drawer title="New forum" close={close}><form className="space-y-4" onSubmit={e => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            setList([...list, { id: crypto.randomUUID(), title: String(data.get('title')).trim(), course: String(data.get('course')), threads: 0, posts: 0, last: 'Created just now', pinned: false }]);
            close();
        }}>
            <Field label="Forum title"><input name="title" className="input" required pattern=".*\S.*"/></Field>
            <Field label="Course"><select name="course" className="select">{forums.map(f => <option key={f.id}>{f.course}</option>)}</select></Field>
            <button className="btn btn-primary">Create forum</button>
        </form></Drawer>}
        {forum && <Drawer title={forum.title} subtitle={`${forum.course} · Threads`} close={close}>
            {topics.filter(t => t.forum === forum.id).map(t => <button className="block w-full rounded-lg border p-3 text-left" key={t.id} onClick={() => setSelected(t.id)}>{t.title}</button>)}
            {!topics.some(t => t.forum === forum.id) && <p>No threads yet.</p>}
        </Drawer>}
        {topic && <Drawer key={topic.id} title={topic.title} subtitle={`${list.find(f => f.id === topic.forum)?.course} forum · started by ${topic.author} · ${topic.replies} replies`} close={close}>
            <form className="space-y-4" onSubmit={e => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const reply = String(data.get('reply') ?? '').trim();
                const nextForum = String(data.get('forum') ?? topic.forum);
                if (student && !reply) return;
                setTopics(topics.map(t => t !== topic ? t : { ...t, forum: nextForum, pinned: student ? t.pinned : data.has('pin'),
                    allowReplies: student ? t.allowReplies : data.has('allow'), replies: t.replies + Number(!!reply), updated: 'Just now', responses: reply ? [...t.responses, reply] : t.responses }));
                setList(list.map(f => ({ ...f, threads: f.threads + Number(f.id === nextForum) - Number(f.id === topic.forum),
                    posts: f.posts + Number(f.id === nextForum && !!reply), last: f.id === nextForum ? 'Updated just now' : f.last })));
                close();
            }}>
                {!student && <Card title="Moderation"><div className="space-y-3">
                    <label className="block"><input name="pin" type="checkbox" defaultChecked={topic.pinned}/> Pin this thread to the top of the forum</label>
                    <label className="block"><input name="allow" type="checkbox" defaultChecked={topic.allowReplies}/> Allow student replies</label>
                    <Field label="Move thread"><select className="select" name="forum" defaultValue={topic.forum}>{list.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}</select></Field>
                </div></Card>}
                {topic.responses.map((r,i) => <p key={i} className="rounded-lg bg-brand-50 p-3"><strong>You</strong><br/>{r}</p>)}
                {(!student || topic.allowReplies) ? <><Field label="Reply"><textarea aria-label="Reply" className="input min-h-24" name="reply" required={student} placeholder="Write a reply" defaultValue={student ? undefined : topic.suggestedReply}/></Field>
                    <div className="flex justify-end gap-2"><button type="button" className="btn btn-outline" onClick={close}>Close</button><button className="btn btn-primary">Post reply</button></div></> : <p>This thread is closed to replies.</p>}
            </form>
        </Drawer>}
    </div>;
}
