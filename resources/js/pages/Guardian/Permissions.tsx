import { FormFeedback } from '@/components/ui/form-feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeCheckbox } from '@/components/ui/native-checkbox';
import { Form, Head, Link } from '@inertiajs/react';

type Entry = {
    id: string;
    guardian: string;
    student: string;
    revoked: boolean;
    fields: string[];
};
type Props = {
    entries: Entry[];
    previous: string | null;
    next: string | null;
};

export default function Permissions({ entries, previous, next }: Props) {
    return (
        <main className="portal-page">
            <Head title="Guardian permissions" />
            <header className="desk-heading">
                <p className="portal-kicker">Access administration</p>
                <h1 className="portal-title">Guardian permissions</h1>
                <p>Manage who can see a student's completed lesson count.</p>
            </header>
            <div className="desk-grid">
                <section>
                    <h2 className="desk-section">Permission register</h2>
                    {entries.length ? (
                        <ul className="mt-4 divide-y">
                            {entries.map((e) => (
                                <li className="py-4 break-words" key={e.id}>
                                    <p className="portal-kicker">{e.revoked ? 'Revoked' : 'Active'}</p>
                                    <h3 className="font-semibold">{e.guardian}</h3>
                                    <p>Student reference: {e.student}</p>
                                    <p>Fields: {e.fields.join(', ').replaceAll('_', ' ')}</p>
                                    {!e.revoked && (
                                        <details>
                                            <summary className="min-h-11 cursor-pointer py-2 underline">
                                                Revoke access
                                            </summary>
                                            <Form method="delete" action={`/guardian/permissions/${e.id}`}>
                                                {({ processing }) => (
                                                    <Button variant="destructive" disabled={processing}>
                                                        Confirm revocation
                                                    </Button>
                                                )}
                                            </Form>
                                        </details>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="desk-empty">No permissions recorded.</p>
                    )}
                    <nav aria-label="Permission pages">
                        {previous && (
                            <Link className="desk-link" href={previous}>
                                Previous permissions
                            </Link>
                        )}
                        {next && (
                            <Link className="desk-link" href={next}>
                                More permissions
                            </Link>
                        )}
                    </nav>
                </section>
                <aside className="portal-panel desk-shelf">
                    <h2 className="desk-section">Approve sharing</h2>
                    <Form action="/guardian/permissions" method="post" resetOnSuccess className="mt-4 grid gap-4">
                        {({ errors, processing, recentlySuccessful }) => (
                            <FormFeedback errors={errors}>
                                <label>
                                    Guardian account email
                                    <Input
                                        type="email"
                                        name="guardian_email"
                                        required
                                    />
                                </label>
                                <label>
                                    Upstream student reference
                                    <Input name="student_reference" required />
                                </label>
                                <p className="desk-note">
                                    The account must already hold the guardian role. Only lesson completion totals will
                                    be shared.
                                </p>
                                <label>
                                    <NativeCheckbox name="confirmed" value="1" required /> I verified
                                    authorization to share this student's progress with this guardian.
                                </label>
                                <Button disabled={processing}>
                                    Approve progress access
                                </Button>
                                {recentlySuccessful && <p role="status">Permission saved.</p>}
                            </FormFeedback>
                        )}
                    </Form>
                </aside>
            </div>
        </main>
    );
}
