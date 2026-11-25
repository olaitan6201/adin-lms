import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
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
    const unread = notices.filter(notice => !notice.read_at);
    const ordered = [...unread, ...notices.filter(notice => notice.read_at)];
    const empty = !notices.length && !messages.length && !announcements.length;

    return (
        <CommunityPage title="Community inbox">
            {empty && (
                <Alert role="status">
                    <AlertTitle>You're all caught up</AlertTitle>
                    <AlertDescription>No notifications, announcements or private messages.</AlertDescription>
                </Alert>
            )}
            {notices.length > 0 && <section>
                <h2 className="text-xl font-semibold">
                    Notifications ({unread.length} unread)
                </h2>
                <ul>
                    {ordered.map((n) => (
                        <li className="space-y-1 border-b py-3" key={n.id}>
                            <p>
                                <strong>{n.read_at ? 'Read' : 'Unread'}</strong> · {n.body}
                            </p>
                            <Link
                                as="button"
                                className={buttonVariants({ variant: 'outline' })}
                                method="patch"
                                data={{ read: !n.read_at }}
                                href={`/community/notifications/${n.id}`}
                            >
                                Mark as {n.read_at ? 'unread' : 'read'}
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>}
            {announcements.length > 0 && <Announcements entries={announcements} />}
            {messages.length > 0 && <section>
                <h2 className="text-xl font-semibold">Private messages</h2>
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
            </section>}
            {canRecover && <Button asChild variant="outline"><Link href="/community/delivery-failures">Review failed email deliveries</Link></Button>}
            {canAnnounce && <EntryForm action="/community/announcements" title="Publish institutional announcement" />}
        </CommunityPage>
    );
}
