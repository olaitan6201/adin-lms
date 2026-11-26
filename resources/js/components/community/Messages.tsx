import { MessageComposer } from './MessageComposer';

import { useRef, type FormEvent } from 'react';
import { Avatar } from '@/components/registry/people/Person';
import { Action } from '@/components/ui/controls/Action';
import type { useConversations } from './useConversations';
import { Send } from 'lucide-react';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import type { Conversation } from '@/types/community/communication';

type MessagesProps = {
    inbox: ReturnType<typeof useConversations>;
    recipients: Conversation[];
    composing: boolean;
    close: () => void;
};

export function Messages({ inbox, recipients, composing, close }: MessagesProps) {
    const { messages, thread, open, send, reply } = inbox;
    const composer = useRef<HTMLInputElement>(null);

    function submitReply(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!thread) {
            return;
        }

        const body = String(new FormData(event.currentTarget).get('body')).trim();
        if (!body) {
            return;
        }

        reply(thread.id, body);
        event.currentTarget.reset();
    }

    return (
        <Card title="Messages" subtitle="Sample conversations. Messages and replies stay in this workspace and are not delivered." bodyClassName="p-0">
            <div className="grid divide-y lg:grid-cols-[320px_1fr] lg:divide-x lg:divide-y-0">
                <ul className="divide-y">
                    {messages.map((m) => (
                        <li key={m.id}>
                            <button
                                className={`flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left ${thread?.id === m.id ? 'border-brand-500 bg-ink-50' : 'border-transparent hover:bg-ink-50'}`}
                                onClick={() => open(m.id)}
                            >
                                <Avatar name={m.name} />
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
                        <div className="flex items-start gap-3">
                            <Avatar name={thread.name} large />
                            <h2 className="min-w-0 flex-1 text-sm font-semibold">
                                {thread.name}
                                <small className="block font-normal text-ink-500">{thread.subject}</small>
                            </h2>
                            <Action
                                variant="primary"
                                size="sm"
                                icon="send"
                                onClick={() => composer.current?.focus()}
                            >
                                Reply
                            </Action>
                        </div>
                        {thread.conversation.map((post, i) => (
                            <p
                                key={i}
                                className={`rounded-xl border p-3.5 text-sm ${post.mine ? 'ml-8 border-brand-200 bg-brand-50' : 'bg-ink-50'}`}
                            >
                                {post.body}
                                <small className="mt-2 block text-ink-500">{post.time}</small>
                            </p>
                        ))}
                        <form key={thread.id} className="flex gap-2" onSubmit={submitReply}>
                            <input
                                ref={composer}
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
            {composing && <MessageComposer {...{ recipients, close, send }} />}
        </Card>
    );
}
