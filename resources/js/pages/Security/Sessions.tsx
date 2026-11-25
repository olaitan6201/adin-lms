import { Form, Head, Link } from '@inertiajs/react';
import { DeskHeading } from '../../components/academics/DeskHeading';

type Session = { id: string; full_name: string; email: string; last_seen: string; expires_at: string };
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
        <main className="portal-page space-y-4">
            <Head title="Active sessions" />
            <DeskHeading title="Active sessions" area="ICT operations">
                Check the account and last active time before revoking a session. That device must then sign
                in again.
            </DeskHeading>
            {!sessions.length && <p>No active sessions.</p>}
            <ol className="divide-y">
                {sessions.map((s) => (
                    <li key={s.id} className="space-y-2 py-3">
                        <strong>{s.full_name}</strong> · {s.email} · Session {s.id.slice(-8)}
                        <p>
                            Last active {new Date(s.last_seen).toLocaleString()} · expires{' '}
                            {new Date(s.expires_at).toLocaleString()}
                        </p>
                        <Form method="delete" action={`/security/sessions/${s.id}`}>
                            {({ processing }) => (
                                <button
                                    disabled={processing}
                                    aria-label={`Revoke session ${s.id.slice(-8)} for ${s.full_name}`}
                                    className="underline"
                                >
                                    Revoke session
                                </button>
                            )}
                        </Form>
                    </li>
                ))}
            </ol>
            {previous && <Link href={previous}>Previous page</Link>}{' '}
            {next && <Link href={next}>Next page</Link>}
        </main>
    );
}
