import { useState } from 'react';
import type { Conversation } from '@/types/community/communication';

export function useConversations(initial: Conversation[]) {
    const [messages, setMessages] = useState(initial);
    const [selected, setSelected] = useState(initial[0]?.id);
    const thread = messages.find(message => message.id === selected);
    const unread = messages.reduce((sum, message) => sum + message.unread, 0);

    function open(id: string) {
        setSelected(id);
        setMessages(current => current.map(message => message.id === id ? { ...message, unread: 0 } : message));
    }

    function reply(id: string, body: string) {
        setMessages(current => current.map(message => message.id === id ? {
            ...message,
            unread: 0,
            preview: body,
            time: 'Just now',
            conversation: [...message.conversation, { mine: true, body }],
        } : message));
    }

    function send(name: string, subject: string, body: string) {
        const message = {
            id: crypto.randomUUID(), name, subject, preview: body, time: 'Just now',
            unread: 0, conversation: [{ mine: true, body }],
        };
        setMessages(current => [message, ...current]);
        setSelected(message.id);
    }

    return { messages, thread, unread, open, reply, send };
}
