import type { Announcement } from '@/types/community/communication';
import { useState, type FormEvent } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { Field } from '@/components/ui/controls/Field';

const options = ['In-platform', 'Email', 'SMS', 'Push notification'];
export function Announcements({
    selected,
    select,
    notices,
    publicationDate,
    audiences,
}: {
    notices: Announcement[];
    publicationDate: string;
    audiences: string[];
    selected: string;
    select: (id: string) => void;
}) {
    const [list, setList] = useState(notices);
    const item = list.find((n) => n.id === selected);
    function saveAnnouncement(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const draft = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)?.value === 'draft';
        const entry = {
            id: item?.id ?? crypto.randomUUID(),
            title: String(data.get('title')).trim(),
            audience: String(data.get('audience')),
            body: String(data.get('body')).trim(),
            channels: ['In-platform', ...data.getAll('channel').map(String)],
            date: publicationDate,
            status: draft ? 'Draft' : 'Published locally',
        };
        setList(item ? list.map((n) => (n === item ? entry : n)) : [entry, ...list]);
        select('');
    }

    return (
        <Card
            title="Announcements and notices"
            subtitle="Publishing adds a sample notice to this workspace. No email, SMS or push notification is sent."
            actions={
                <Action
                    icon="megaphone"
                    size="sm"
                    variant="primary"
                    onClick={() => select('new')}
                >
                    New announcement
                </Action>
            }
        >
            <Table
                columns={['Notice', 'Audience', 'Date', 'Channels', 'Status', '']}
                rowKeys={list.map((notice) => notice.id)}
                rows={list.map((n) => [
                    n.title,
                    <Badge key="audience">{n.audience}</Badge>,
                    n.date,
                    n.channels.join(' and '),
                    <Badge key="status" tone={n.status === 'Draft' ? 'amber' : 'emerald'}>
                        {n.status}
                    </Badge>,
                    <Action key="actions" size="sm" onClick={() => select(n.id)}>
                        Edit
                    </Action>,
                ])}
            />
            {selected && (
                <Drawer
                    title={item ? 'Edit announcement' : 'New announcement'}
                    subtitle="Publish a sample notice here. No email, SMS or push notification is sent."
                    close={() => select('')}
                >
                    <form className="space-y-4" onSubmit={saveAnnouncement}>
                        <Field label="Title">
                            <input
                                className="input"
                                name="title"
                                defaultValue={item?.title}
                                required
                                pattern=".*\S.*"
                            />
                        </Field>
                        <Field label="Audience">
                            <select className="select" name="audience" defaultValue={item?.audience}>
                                {audiences.map((a) => (
                                    <option key={a}>{a}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Message">
                            <textarea
                                className="input min-h-28"
                                name="body"
                                defaultValue={item?.body}
                                required
                            />
                        </Field>
                        <fieldset className="space-y-2 rounded-xl border p-4">
                            <legend>Sample delivery channels</legend>
                            {options.map((o) => (
                                <label key={o} className="block">
                                    <input
                                        type="checkbox"
                                        name="channel"
                                        value={o}
                                        disabled={o === 'In-platform'}
                                        defaultChecked={
                                            o === 'In-platform' || (item?.channels ?? ['Email']).includes(o)
                                        }
                                    />{' '}
                                    {o}
                                </label>
                            ))}
                        </fieldset>
                        <div className="flex justify-end gap-2">
                            <button value="draft" className="btn btn-outline">
                                Save draft
                            </button>
                            <button value="publish" className="btn btn-primary">
                                Publish locally
                            </button>
                        </div>
                    </form>
                </Drawer>
            )}
        </Card>
    );
}
