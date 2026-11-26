import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { RecordPanel } from '../../components/identity/WorkspaceRecord';
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
    const unread = notices.filter((notice) => !notice.read_at);
    const ordered = [...unread, ...notices.filter((notice) => notice.read_at)];
    const empty = !notices.length && !messages.length && !announcements.length;
    const [view, setView] = useState<'Notifications' | 'Private messages' | 'Announcements'>('Notifications');
    const channels = [
        ['Notifications', unread.length],
        ['Private messages', messages.length],
        ['Announcements', announcements.length],
    ] as const;

    return (
        <CommunityPage title="Community inbox">
            {empty && (
                <Alert role="status">
                    <AlertTitle>You're all caught up</AlertTitle>
                    <AlertDescription>No notifications, announcements or private messages.</AlertDescription>
                </Alert>
            )}
            <div role="group" aria-label="Inbox sections" className="card flex flex-wrap gap-1 px-2">
                {channels.map(([name, count]) => (
                    <button
                        type="button"
                        key={name}
                        aria-pressed={view === name}
                        onClick={() => setView(name)}
                        className={`border-b-2 px-3 py-2.5 text-sm font-medium ${
                            view === name
                                ? 'border-brand-600 text-brand-800'
                                : 'border-transparent text-ink-600 hover:text-ink-900'
                        }`}
                    >
                        {name}
                        <span className="ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[11px]">{count}</span>
                    </button>
                ))}
            </div>
            {view === 'Notifications' && (
                <RecordPanel title={`Notifications (${unread.length} unread)`}>
                    {!notices.length && <p>No notifications.</p>}
                    <ul>
                        {ordered.map((n) => (
                            <li className="space-y-1 border-b py-3" key={n.id}>
                                <p>
                                    <strong
                                        className={
                                            n.read_at ? 'badge bg-ink-100 text-ink-600' : 'badge bg-brand-100 text-brand-800'
                                        }
                                    >
                                        {n.read_at ? 'Read' : 'Unread'}
                                    </strong>{' '}
                                    · {n.body}
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
                </RecordPanel>
            )}
            {view === 'Announcements' && <Announcements entries={announcements} />}
            {view === 'Private messages' && (
                <RecordPanel title="Private messages" description="Conversations between you and other course participants.">
                    {!messages.length && <p>No private messages.</p>}
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
                </RecordPanel>
            )}
            {canRecover && (
                <Button asChild variant="outline">
                    <Link href="/community/delivery-failures">Review failed email deliveries</Link>
                </Button>
            )}
            {canAnnounce && <EntryForm action="/community/announcements" title="Publish institutional announcement" />}
        </CommunityPage>
    );
}
