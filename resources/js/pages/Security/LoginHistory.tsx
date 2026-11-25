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
    account_name: string | null;
    occurred_at: string;
    outcome: keyof typeof outcomeLabels;
};

type LoginHistoryProps = {
    events: SignInEvent[];
    sessionsUrl: string | null;
    previous: string | null;
    next: string | null;
};

export default function LoginHistory({ events, sessionsUrl, previous, next }: LoginHistoryProps) {
    return (
        <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 wrap-anywhere px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Sign-in history" />
            <header className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Institutional security</p>
                <h1 className="break-words text-3xl font-semibold tracking-tight">Sign-in history</h1>
                <p>Review password checks, authenticator activity and session changes across accounts.</p>
                {sessionsUrl && (
                    <Link className="font-medium text-primary underline underline-offset-4" href={sessionsUrl}>
                        Manage active sessions
                    </Link>
                )}
            </header>
            <section aria-labelledby="activity-heading" className="min-w-0 rounded-lg border p-4 sm:p-6 mt-6">
                <h2 id="activity-heading" className="text-xl font-semibold tracking-tight">
                    Authentication events
                </h2>
                {!events.length ? (
                    <p className="py-4 text-sm text-muted-foreground">No authentication events recorded on this page.</p>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">Newest first. Times are shown in your local time zone.</p>
                        <ol className="mt-4 divide-y border-y border-border">
                            {events.map((event) => (
                                <li className="grid gap-1 py-4 sm:grid-cols-[1fr_auto]" key={event.id}>
                                    <div>
                                        <strong>{outcomeLabels[event.outcome] ?? event.outcome}</strong>
                                        <p className="text-sm text-muted-foreground break-all">
                                            {event.account_name ?? 'Account not identified'}
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
                            <Link className="font-medium text-primary underline underline-offset-4" href={previous}>
                                Newer events
                            </Link>
                        )}
                        {next && (
                            <Link className="font-medium text-primary underline underline-offset-4" href={next}>
                                Older events
                            </Link>
                        )}
                    </nav>
                )}
            </section>
        </main>
    );
}
