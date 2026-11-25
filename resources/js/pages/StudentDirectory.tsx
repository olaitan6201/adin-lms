import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NativeCheckbox } from '@/components/ui/native-checkbox';
import { Form, Head, Link } from '@inertiajs/react';
import { DeskHeading } from '../components/academics/DeskHeading';

type Student = {
    id: string;
    external_student_id: string;
    matric_number: string | null;
    source_name: string | null;
    status: string | null;
};
type Props = {
    students: Student[];
    q: string;
    next: string | null;
    previous: string | null;
    manage: boolean;
    link: boolean;
    receipt: string | null;
};

export default function StudentDirectory({ students, q, previous, next, manage, link, receipt }: Props) {
    return (
        <main className="portal-page space-y-5">
            <Head title="Student records" />
            <DeskHeading area="Registrar" title="Student records">
                Find a student to inspect their academic history, including withdrawn registrations and released
                results.
            </DeskHeading>
            <Form action="/students" method="get">
                <label>
                    Find by name, matric number or upstream ID{' '}
                    <Input name="q" defaultValue={q} />
                </label>
                <Button>Search</Button>
            </Form>
            <ul className="divide-y">
                {students.map((s) => (
                    <li key={s.id} className="py-3">
                        <Link className="underline" href={`/students/${s.id}/history`}>
                            {s.source_name || s.external_student_id}
                        </Link>
                        {' · '}
                        {s.matric_number || 'Awaiting matric number'} · {s.status || 'Awaiting profile'}
                    </li>
                ))}
            </ul>
            {!students.length && <p>No matching student records.</p>}
            {previous && <Link href={previous}>Previous page</Link>} {next && <Link href={next}>Next page</Link>}
            {receipt && <p role="status">{receipt}</p>}
            {link && (
                <details>
                    <summary>Link a verified LMS account</summary>
                    <Form action="/students/link" method="post" className="grid gap-3">
                        {({ errors, processing }) => (
                            <>
                                <label>
                                    Upstream student ID <Input name="student" required />
                                </label>
                                <label>
                                    Existing LMS account email{' '}
                                    <Input type="email" name="account" required />
                                </label>
                                <label>
                                    <NativeCheckbox name="verified" value="1" required /> I checked both
                                    identities against the registrar's record.
                                </label>
                                {Object.entries(errors).map(([k, v]) => (
                                    <p role="alert" key={k}>
                                        {v}
                                    </p>
                                ))}
                                <Button className="justify-self-start" disabled={processing}>
                                    Link verified account
                                </Button>
                            </>
                        )}
                    </Form>
                </details>
            )}
            {manage && (
                <section className="portal-panel desk-shelf">
                    <h2 className="desk-section">Reconcile registrar feeds</h2>
                    <p>
                        Use an authorised upstream export. Corrections to official registration belong with the
                        registrar.
                    </p>
                    {(['registrations', 'profiles'] as const).map((kind) => (
                        <details key={kind} className="border-b py-3">
                            <summary>Import {kind}</summary>
                            <p>
                                {kind === 'profiles'
                                    ? 'CSV or single-sheet XLSX: student_id, matric_number, name, email, programme, level, session, status. The optional photo column accepts a JPEG data URL up to 256 KiB and 1024 × 1024 pixels. Blank leaves the existing photo unchanged.'
                                    : 'CSV: student_id, offering_id, status, revision. Replayed rows are ignored.'}
                            </p>
                            <Form action={`/students/feeds/${kind}`} method="post">
                                {({ processing, errors }) => (
                                    <>
                                        <label>
                                            Registrar export{' '}
                                            <Input
                                                type="file"
                                                name="feed"
                                                accept={kind === 'profiles' ? '.csv,.xlsx' : '.csv'}
                                                required
                                            />
                                        </label>
                                        <Button
                                            disabled={processing}
                                        >
                                            Reconcile {kind}
                                        </Button>
                                        {errors.feed && <p role="alert">{errors.feed}</p>}
                                    </>
                                )}
                            </Form>
                        </details>
                    ))}
                </section>
            )}
        </main>
    );
}
