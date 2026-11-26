import { Head, Link } from '@inertiajs/react';
import { RecordHeading, RecordPanel } from '@/components/shared/records/WorkspaceRecord';

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
        <main className="grid min-w-0 gap-5 wrap-anywhere">
            <Head title="Sign-in history" />
            <RecordHeading
                area="Institutional security"
                title="Sign-in history"
                description="Review password checks, authenticator activity and session changes across accounts."
                actions={
                    sessionsUrl && (
                        <Link className="btn btn-outline" href={sessionsUrl}>
                            Manage active sessions
                        </Link>
                    )
                }
            />
            <RecordPanel title="Authentication events" description="Newest first. Times are shown in your local time zone.">
                {!events.length ? (
                    <p className="py-4 text-sm text-muted-foreground">No authentication events recorded on this page.</p>
                ) : (
                    <>
                        <ol className="relative space-y-5 border-l border-ink-200 pl-5">
                            {events.map((event) => (
                                <li className="relative grid gap-1 text-sm sm:grid-cols-[1fr_auto]" key={event.id}>
                                    <span
                                        aria-hidden="true"
                                        className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-brand-600"
                                    />
                                    <div>
                                        <strong>{outcomeLabels[event.outcome] ?? event.outcome}</strong>
                                        <p className="text-sm text-muted-foreground break-all">
                                            {event.account_name ?? 'Account not identified'}
                                        </p>
                                    </div>
                                    <time dateTime={event.occurred_at}>{new Date(event.occurred_at).toLocaleString()}</time>
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
            </RecordPanel>
        </main>
    );
}
