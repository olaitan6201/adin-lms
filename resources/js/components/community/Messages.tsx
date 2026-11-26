import type { FormEvent } from 'react';
import type { useConversations } from './useConversations';
import { Send } from 'lucide-react';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import type { Conversation } from '@/types/community/communication';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { Field } from '@/components/ui/controls/Field';

type MessagesProps = {
    inbox: ReturnType<typeof useConversations>;
    recipients: Conversation[];
    composing: boolean;
    close: () => void;
};

export function Messages({ inbox, recipients, composing, close }: MessagesProps) {
    const { messages, thread, open, send, reply } = inbox;
    const available = recipients.filter((recipient) => recipient.name?.trim());

    function submitReply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!thread) return;
        const body = String(new FormData(event.currentTarget).get('body')).trim();
        if (!body) return;
        reply(thread.id, body);
        event.currentTarget.reset();
    }

    function submitMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const recipient = available.find((option) => option.id === fields.get('recipient'));
        const body = String(fields.get('body') ?? '').trim();
        if (!recipient || !body) return;
        send(recipient.name, String(fields.get('subject')), body);
        close();
    }

    return (
        <Card title="Messages" subtitle="Lecturer, student and private conversations" bodyClassName="p-0">
            <div className="grid divide-y lg:grid-cols-[320px_1fr] lg:divide-x lg:divide-y-0">
                <ul className="divide-y">
                    {messages.map((m) => (
                        <li key={m.id}>
                            <button
                                className={`flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left ${thread?.id === m.id ? 'border-brand-500 bg-ink-50' : 'border-transparent hover:bg-ink-50'}`}
                                onClick={() => open(m.id)}
                            >
                                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">
                                    {m.name
                                        .split(' ')
                                        .slice(-2)
                                        .map((n) => n[0])
                                        .join('')}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex justify-between gap-2 text-sm">
                                        <strong>{m.name}</strong>
                                        <small>{m.time}</small>
                                    </span>
                                    <span className="block truncate text-sm">{m.subject}</span>
                                    <small className="block truncate text-ink-500">{m.preview}</small>
                                </span>
                                {m.unread > 0 && <Badge>{m.unread}</Badge>}
                            </button>
                        </li>
                    ))}
                </ul>
                {thread ? (
                    <section className="min-w-0 space-y-4 p-5">
                        <h2 className="text-sm font-semibold">
                            {thread.name}
                            <small className="block font-normal text-ink-500">{thread.subject}</small>
                        </h2>
                        {thread.conversation.map((post, i) => (
                            <p
                                key={i}
                                className={`rounded-xl border p-3.5 text-sm ${post.mine ? 'ml-8 border-brand-200 bg-brand-50' : 'bg-ink-50'}`}
                            >
                                {post.body}
                            </p>
                        ))}
                        <form key={thread.id} className="flex gap-2" onSubmit={submitReply}>
                            <input
                                className="input min-w-0 flex-1"
                                required
                                pattern=".*\S.*"
                                aria-label="Write a message"
                                placeholder="Write a message"
                                name="body"
                            />
                            <button className="btn btn-primary" aria-label="Send message">
                                <Send size={16} />
                            </button>
                        </form>
                    </section>
                ) : (
                    <p className="p-5 text-sm">No conversations yet.</p>
                )}
            </div>
            {composing && (
                <Drawer title="New message" close={close}>
                    <form className="space-y-4" onSubmit={submitMessage}>
                        <Field label="Recipient">
                            <select name="recipient" className="select" required disabled={!available.length}>
                                {available.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        {!available.length && <p role="status">No recipients available.</p>}
                        <Field label="Subject">
                            <input name="subject" className="input" required pattern=".*\S.*" />
                        </Field>
                        <Field label="Message">
                            <textarea name="body" className="input min-h-24" required />
                        </Field>
                        <button className="btn btn-primary" disabled={!available.length}>
                            Send message
                        </button>
                    </form>
                </Drawer>
            )}
        </Card>
    );
}
