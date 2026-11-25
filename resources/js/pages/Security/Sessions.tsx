import { Button } from '@/components/ui/button';
import { Form, Head, Link } from '@inertiajs/react';
import { DeskHeading } from '../../components/academics/DeskHeading';

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
        <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 wrap-anywhere px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Active sessions" />
            <DeskHeading title="Active sessions" area="ICT operations">
                Check the account and last active time before revoking a session. That device must then sign in again.
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
                                <Button variant="destructive"
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
        </main>
    );
}
