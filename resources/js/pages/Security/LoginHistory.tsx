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
        <main className="portal-page">
            <Head title="Sign-in history" />
            <header className="desk-heading">
                <p className="portal-kicker">Institutional security</p>
                <h1 className="portal-title">Sign-in history</h1>
                <p>
                    Review password checks, authenticator activity and session changes across accounts.
                </p>
            </header>
            <section aria-labelledby="activity-heading" className="portal-panel mt-6">
                <h2 id="activity-heading" className="desk-section">
                    Authentication events
                </h2>
                {!events.length ? (
                    <p className="desk-empty">No authentication events recorded on this page.</p>
                ) : (
                    <>
                        <p className="desk-note">
                            Newest first. Times are shown in your local time zone.
                        </p>
                        <ol className="mt-4 divide-y border-y border-[var(--portal-line)]">
                            {events.map((event) => (
                                <li className="grid gap-1 py-4 sm:grid-cols-[1fr_auto]" key={event.id}>
                                    <div>
                                        <strong>{outcomeLabels[event.outcome] ?? event.outcome}</strong>
                                        <p className="desk-note break-all">
                                            {event.user_id
                                                ? `Account ID: ${event.user_id}`
                                                : 'Account not identified'}
                                        </p>
                                    </div>
                                    <time dateTime={event.occurred_at}>
                                        {new Date(event.occurred_at).toLocaleString()}
                                    </time>
                                </li>
                            ))}
                        </ol>
                    </>
                )}
                {(previous || next) && (
                    <nav aria-label="History pages" className="mt-3 flex flex-wrap gap-4">
                        {previous && (
                            <Link className="desk-link" href={previous}>
                                Newer events
                            </Link>
                        )}
                        {next && (
                            <Link className="desk-link" href={next}>
                                Older events
                            </Link>
                        )}
                    </nav>
                )}
            </section>
        </main>
    );
}
