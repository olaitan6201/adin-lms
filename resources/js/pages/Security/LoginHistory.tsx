import { Head, Link } from '@inertiajs/react';

const outcomeLabels = {
    'password.failed': 'Password rejected',
    'password.accepted': 'Password accepted',
    'mfa.issued': 'Authenticator issued',
    'mfa.enrolled': 'Authenticator enrolled',
    'mfa.accepted': 'Authenticator code accepted',
    'mfa.failed': 'Authenticator code rejected',
    'session.expired': 'Session expired',
    'session.revoked': 'Session revoked',
    'session.logout': 'Signed out',
} as const;

type SignInEvent = {
    id: string;
    user_id: string | null;
    occurred_at: string;
    outcome: keyof typeof outcomeLabels;
};

type LoginHistoryProps = {
    events: SignInEvent[];
    previous: string | null;
    next: string | null;
};

export default function LoginHistory({ events, previous, next }: LoginHistoryProps) {
    return (
        <main className="mx-auto max-w-4xl px-6 py-12">
            <Head title="Sign-in history" />
            <h1 className="mb-6 text-3xl font-semibold">Sign-in history</h1>
            {!events.length && <p>No authentication events recorded.</p>}
            <ol className="divide-y">
                {events.map((event) => (
                    <li className="py-3" key={event.id}>
                        <strong>{outcomeLabels[event.outcome] ?? event.outcome}</strong>
                        <p>
                            Account:{' '}
                            <span className="break-all">{event.user_id ?? 'Unknown'}</span>
                        </p>
                        <time dateTime={event.occurred_at}>
                            {new Date(event.occurred_at).toLocaleString()}
                        </time>
                    </li>
                ))}
            </ol>
            <nav aria-label="History pages" className="flex gap-4 py-4">
                {previous && (
                    <Link className="underline" href={previous}>
                        Newer events
                    </Link>
                )}
                {next && (
                    <Link className="underline" href={next}>
                        Older events
                    </Link>
                )}
            </nav>
        </main>
    );
}
