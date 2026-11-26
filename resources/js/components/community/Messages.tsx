import { useState } from 'react';
import { Send } from 'lucide-react';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { messages } from './engagementFixtures';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { Field } from '@/components/ui/controls/Field';

const initial = messages.map((m,i) => ({ ...m, conversation: i === 0 ? [
    { mine: false, body: 'Some of you asked whether the deadline can move to Friday because of the mid-term on the 18th. I have extended the submission window to Friday 20 November 23:59 for everyone, not only for those who asked.' },
    { mine: true, body: 'Thank you. Will the mark split stay the same, or will the rubric change for the extended window?' },
] : [{ mine: false, body: m.preview }] }));

export function Messages({ composing, close, read }: { composing: boolean; close: () => void; read: (count: number) => void }) {
    const [list, setList] = useState(initial);
    const [selected, setSelected] = useState(initial[0].id);
    const thread = list.find(m => m.id === selected)!;
    return <Card title="Messages" subtitle="Lecturer, student and private conversations" bodyClassName="p-0">
        <div className="grid divide-y lg:grid-cols-[320px_1fr] lg:divide-x lg:divide-y-0"><ul className="divide-y">{list.map(m =>
            <li key={m.id}><button className={`flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left ${selected === m.id ? 'border-brand-500 bg-ink-50' : 'border-transparent hover:bg-ink-50'}`}
                onClick={() => {
                    setSelected(m.id);
                    read(m.unread);
                    setList(list.map(t => t.id === m.id ? { ...t, unread: 0 } : t));
                }}>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">{m.name.split(' ').slice(-2).map(n => n[0]).join('')}</span>
                <span className="min-w-0 flex-1"><span className="flex justify-between gap-2 text-sm"><strong>{m.name}</strong><small>{m.time}</small></span>
                    <span className="block truncate text-sm">{m.subject}</span><small className="block truncate text-ink-500">{m.preview}</small></span>{m.unread > 0 && <Badge>{m.unread}</Badge>}
            </button></li>)}</ul>
            <section className="min-w-0 space-y-4 p-5"><h2 className="text-sm font-semibold">{thread.name}<small className="block font-normal text-ink-500">{thread.subject}</small></h2>
                {thread.conversation.map((post,i) => <p key={i} className={`rounded-xl border p-3.5 text-sm ${post.mine ? 'ml-8 border-brand-200 bg-brand-50' : 'bg-ink-50'}`}>{post.body}</p>)}
                <form key={thread.id} className="flex gap-2" onSubmit={e => {
                    e.preventDefault();
                    const body = String(new FormData(e.currentTarget).get('body')).trim();
                    read(thread.unread);
                    setList(list.map(t => t !== thread ? t : { ...t, unread: 0, preview: body, time: 'Just now', conversation: [...t.conversation,{ mine: true, body }] }));
                    e.currentTarget.reset();
                }}>
                    <input className="input min-w-0 flex-1" required pattern=".*\S.*" aria-label="Write a message" placeholder="Write a message" name="body"/>
                    <button className="btn btn-primary" aria-label="Send message"><Send size={16}/></button>
                </form>
            </section>
        </div>
        {composing && <Drawer title="New message" close={close}><form className="space-y-4" onSubmit={e => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const body = String(data.get('body')).trim();
            if (!body) return;
            const id = crypto.randomUUID();
            setList([{ id, name: String(data.get('name')), subject: String(data.get('subject')), preview: body, time: 'Just now', unread: 0, conversation: [{ mine: true, body }] }, ...list]);
            setSelected(id);
            close();
        }}>
            <Field label="Recipient"><select name="name" className="select">{messages.map(m => <option key={m.id}>{m.name}</option>)}</select></Field>
            <Field label="Subject"><input name="subject" className="input" required pattern=".*\S.*"/></Field>
            <Field label="Message"><textarea name="body" className="input min-h-24" required/></Field>
            <button className="btn btn-primary">Send message</button>
        </form></Drawer>}
    </Card>;
}
