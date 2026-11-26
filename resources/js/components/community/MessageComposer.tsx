import type { FormEvent } from 'react';
import type { useConversations } from './useConversations';
import type { Conversation } from '@/types/community/communication';
import { Drawer } from '@/components/ui/overlays/DialogDrawer';
import { Field } from '@/components/ui/controls/Field';

type Props = {
    recipients: Conversation[];
    close: () => void;
    send: ReturnType<typeof useConversations>['send'];
};
export function MessageComposer({ recipients, close, send }: Props) {
    const available = recipients.filter((recipient) => recipient.name?.trim());

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
    );
}
