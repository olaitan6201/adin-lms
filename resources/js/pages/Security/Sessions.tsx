import { Button } from '@/components/ui/button';
import { Form, Head, Link } from '@inertiajs/react';
import { RecordHeading, RecordPanel } from '@/components/shared/records/WorkspaceRecord';

type Session = {
    id: string;
    full_name: string;
    email: string;
    last_seen: string;
    expires_at: string;
};
export default function Sessions({
    sessions,
    previous,
    next,
}: {
    sessions: Session[];
    previous: string | null;
    next: string | null;
}) {
    return (
        <main className="grid min-w-0 gap-5 wrap-anywhere">
            <Head title="Active sessions" />
            <RecordHeading
                title="Active sessions"
                area="ICT operations"
                description="Check the account and last active time before revoking a session. That device must then sign in again."
            />
            <RecordPanel title="Session register">
                {!sessions.length && <p>No active sessions.</p>}
                <ol className="divide-y">
                    {sessions.map((s) => (
                        <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                            <div>
                                <strong>{s.full_name}</strong> · {s.email}
                                <p className="font-mono text-xs text-ink-600">Session {s.id.slice(-8)}</p>
                                <p className="mt-1 text-[13px] text-ink-600">
                                    Last active {new Date(s.last_seen).toLocaleString()} · expires{' '}
                                    {new Date(s.expires_at).toLocaleString()}
                                </p>
                            </div>
                            <Form method="delete" action={`/security/sessions/${s.id}`}>
                                {({ processing }) => (
                                    <Button
                                        variant="destructive"
                                        disabled={processing}
                                        aria-label={`Revoke session ${s.id.slice(-8)} for ${s.full_name}`}
                                    >
                                        Revoke session
                                    </Button>
                                )}
                            </Form>
                        </li>
                    ))}
                </ol>
                {previous && <Link href={previous}>Previous page</Link>} {next && <Link href={next}>Next page</Link>}
            </RecordPanel>
        </main>
    );
}
