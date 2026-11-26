import { useState, type FormEvent } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Forum, Thread } from '@/types/community/communication';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { Field } from '@/components/ui/controls/Field';

import { applyTopicChange, type ForumBoard, type TopicChange } from './forumBoard';
import { TopicEditor } from './TopicEditor';

type Selection = { kind: 'topic' | 'forum'; id: string } | { kind: 'new' } | null;

export function Forums({ student, forums, threads }: { forums: Forum[]; threads: Thread[]; student: boolean }) {
    const [{ forums: list, topics }, setBoard] = useState<ForumBoard>({ forums, topics: threads });
    const [selected, setSelected] = useState<Selection>(null);
    const topic = selected?.kind === 'topic' ? topics.find((topic) => topic.id === selected.id) : undefined;
    const forum = selected?.kind === 'forum' ? list.find((forum) => forum.id === selected.id) : undefined;
    const close = () => setSelected(null);
    const openTopic = (id: string) => setSelected({ kind: 'topic', id });

    function moderateForum(id: string) {
        const first = topics.find((topic) => topic.forum === id);
        if (first) openTopic(first.id);
        else setSelected({ kind: 'forum', id });
    }
    function createForum(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const created: Forum = {
            id: crypto.randomUUID(),
            title: String(fields.get('title')).trim(),
            course: String(fields.get('course')),
            threads: 0,
            posts: 0,
            last: 'Created just now',
            pinned: false,
        };
        setBoard((board) => ({ ...board, forums: [...board.forums, created] }));
        close();
    }

    function saveTopic(change: TopicChange) {
        setBoard((board) => applyTopicChange(board, change));
        close();
    }

    return (
        <div className="space-y-5">
            <Card
                className="[&_th:last-child]:w-[110px]"
                title="Forums"
                subtitle="Course forums with moderated threads, peer and group discussion"
                actions={
                    <Action size="sm" icon="plus" variant="primary" onClick={() => setSelected({ kind: 'new' })}>
                        New forum
                    </Action>
                }
            >
                <Table
                    columns={['Forum', 'Threads', 'Posts', 'Last activity', '']}
                    rows={list.map((f) => [
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="truncate font-medium text-ink-800">{f.title}</p>
                                {f.pinned && <Badge tone="amber">Pinned</Badge>}
                            </div>
                            <p className="truncate text-[11.5px] text-ink-400">{f.course}</p>
                        </div>,
                        <span className="text-[13px] tnum">{f.threads}</span>,
                        <span className="text-[13px] tnum">{f.posts}</span>,
                        <span className="text-[12.5px] text-ink-500">{f.last}</span>,
                        <div className="flex justify-end">
                            <Action size="sm" onClick={() => moderateForum(f.id)}>
                                Moderate
                            </Action>
                        </div>,
                    ])}
                />
            </Card>
            <Card
                className="[&_th:last-child]:w-[90px]"
                title="Recent threads"
                subtitle="Threads needing moderation or a lecturer response"
                actions={<Badge tone="amber">{topics.filter((t) => !t.responses.length).length} need review</Badge>}
            >
                <Table
                    columns={['Thread', 'Author', 'Replies', 'Updated', '']}
                    rows={topics.map((t) => [
                        <div className="min-w-0">
                            <p className="truncate font-medium text-ink-800">
                                {t.title} {t.pinned && <Badge>Pinned</Badge>}
                            </p>
                            <p className="truncate text-[11.5px] text-ink-400">{t.tag}</p>
                        </div>,
                        <span className="text-[13px] text-ink-600">{t.author}</span>,
                        <span className="text-[13px] tnum">{t.replies}</span>,
                        <span className="text-[12.5px] text-ink-500">{t.updated}</span>,
                        <div className="flex justify-end">
                            <Action size="sm" onClick={() => openTopic(t.id)}>
                                Open
                            </Action>
                        </div>,
                    ])}
                />
            </Card>
            {selected?.kind === 'new' && (
                <Drawer title="New forum" close={close}>
                    <form className="space-y-4" onSubmit={createForum}>
                        <Field label="Forum title">
                            <input name="title" className="input" required pattern=".*\S.*" />
                        </Field>
                        <Field label="Course">
                            <select name="course" className="select">
                                {forums.map((f) => (
                                    <option key={f.id}>{f.course}</option>
                                ))}
                            </select>
                        </Field>
                        <button className="btn btn-primary">Create forum</button>
                    </form>
                </Drawer>
            )}
            {forum && (
                <Drawer title={forum.title} subtitle={`${forum.course} · Threads`} close={close}>
                    {topics
                        .filter((t) => t.forum === forum.id)
                        .map((t) => (
                            <button
                                className="block w-full rounded-lg border p-3 text-left"
                                key={t.id}
                                onClick={() => openTopic(t.id)}
                            >
                                {t.title}
                            </button>
                        ))}
                    {!topics.some((t) => t.forum === forum.id) && <p>No threads yet.</p>}
                </Drawer>
            )}
            {topic && <TopicEditor key={topic.id} topic={topic} forums={list} student={student} save={saveTopic} close={close} />}
        </div>
    );
}
