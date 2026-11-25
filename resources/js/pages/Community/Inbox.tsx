import { Link } from '@inertiajs/react';
import { Announcements, CommunityPage, EntryForm, type Entry } from '../../components/community/Elements';

type Person = { full_name: string };
type Props = {
    notices: (Entry & { read_at: string | null })[];
    messages: (Entry & {
        sender: Person;
        recipient: Person;
    })[];
    announcements: Entry[];
    canAnnounce: boolean;
    canRecover: boolean;
};

export default function Inbox({ notices, messages, announcements, canAnnounce, canRecover }: Props) {
    return (
        <CommunityPage title="Community inbox">
            {canRecover && (
                <Link className="underline" href="/community/delivery-failures">
                    Review failed email deliveries
                </Link>
            )}
            <section>
                <h2 className="text-xl font-semibold">
                    Notifications ({notices.filter((n) => !n.read_at).length} unread)
                </h2>
                {!notices.length && <p>No notifications yet.</p>}
                <ul>
                    {notices.map((n) => (
                        <li className="space-y-1 border-b py-3" key={n.id}>
                            <p>
                                <strong>{n.read_at ? 'Read' : 'Unread'}</strong> · {n.body}
                            </p>
                            <Link
                                as="button"
                                className="underline"
                                method="patch"
                                data={{ read: !n.read_at }}
                                href={`/community/notifications/${n.id}`}
                            >
                                Mark as {n.read_at ? 'unread' : 'read'}
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
            <Announcements entries={announcements} />
            <section>
                <h2 className="text-xl font-semibold">Private messages</h2>
                {!messages.length && <p>No private messages yet.</p>}
                <ul>
                    {messages.map((m) => (
                        <li className="border-b py-3" key={m.id}>
                            <strong>
                                {m.sender.full_name} to {m.recipient.full_name}
                            </strong>
                            <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        </li>
                    ))}
                </ul>
            </section>
            {canAnnounce && <EntryForm action="/community/announcements" title="Publish institutional announcement" />}
        </CommunityPage>
    );
}
