import type { Announcement } from '@/types/community/communication';
import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { Field } from '@/components/ui/controls/Field';

const options = ['In-platform', 'Email', 'SMS', 'Push notification'];
export function Announcements({ selected, select, notices, publicationDate, audiences }: { notices: Announcement[]; publicationDate: string; audiences: string[]; selected: string; select: (id: string) => void }) {
    const [list, setList] = useState(notices);
    const item = list.find(n => n.id === selected);
    return <Card title="Announcements and notices" subtitle="Lecturer announcements and administrative notices, with optional SMS and push"
        actions={<Action icon="megaphone" size="sm" variant="primary" onClick={() => select('new')}>New announcement</Action>}>
        <Table columns={['Notice','Audience','Date','Channels','Status','']} rows={list.map(n => [
            n.title, <Badge>{n.audience}</Badge>, n.date, n.channels.join(' and '), <Badge tone={n.status === 'Sent' ? 'emerald' : 'amber'}>{n.status}</Badge>, <Action size="sm" onClick={() => select(n.id)}>Edit</Action>,
        ])}/>
        {selected && <Drawer title={item ? 'Edit announcement' : 'New announcement'} subtitle="In-platform notice with optional email, SMS and push" close={() => select('')}>
            <form className="space-y-4" onSubmit={e => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const draft = ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement)?.value === 'draft';
                const entry = { id: item?.id ?? crypto.randomUUID(), title: String(data.get('title')).trim(), audience: String(data.get('audience')), body: String(data.get('body')).trim(),
                    channels: ['In-platform', ...data.getAll('channel').map(String)], date: publicationDate, status: draft ? 'Draft' : 'Sent' };
                setList(item ? list.map(n => n === item ? entry : n) : [entry, ...list]);
                select('');
            }}>
                <Field label="Title"><input className="input" name="title" defaultValue={item?.title} required pattern=".*\S.*"/></Field>
                <Field label="Audience"><select className="select" name="audience" defaultValue={item?.audience}>{audiences.map(a => <option key={a}>{a}</option>)}</select></Field>
                <Field label="Message"><textarea className="input min-h-28" name="body" defaultValue={item?.body} required/></Field>
                <fieldset className="space-y-2 rounded-xl border p-4"><legend>Delivery channels</legend>{options.map((o,i) =>
                    <label key={o} className="block"><input type="checkbox" name="channel" value={o} disabled={!i} defaultChecked={!i || (item?.channels ?? ['Email']).includes(o)}/> {o}</label>)}</fieldset>
                <div className="flex justify-end gap-2"><button value="draft" className="btn btn-outline">Save draft</button><button value="publish" className="btn btn-primary">Publish</button></div>
            </form>
        </Drawer>}
    </Card>;
}
