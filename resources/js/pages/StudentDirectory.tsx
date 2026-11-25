import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VerifiedRecord } from '../components/identity/VerifiedRecord';
import { PortalField } from '../components/PortalForm';
import { FormFeedback } from '@/components/ui/form-feedback';
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
        <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 wrap-anywhere px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Student records" />
            <DeskHeading area="Registrar" title="Student records">
                Find a student to inspect their academic history, including withdrawn registrations and released
                results.
            </DeskHeading>
            <Form action="/students" method="get" className="grid max-w-xl gap-3">
                <label className="grid gap-2 text-sm font-medium">
                    Find by name, matric number or upstream ID{' '}
                    <Input name="q" defaultValue={q} />
                </label>
                <Button>Search</Button>
            </Form>
            <ul className="divide-y">
                {students.map((s) => (
                    <li key={s.id} className="py-3">
                        <Link className="text-primary underline underline-offset-4" href={`/students/${s.id}/history`}>
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
                    <summary className="cursor-pointer py-2 font-medium">Link a verified LMS account</summary>
                    <Form action="/students/link" method="post" className="grid gap-3">
                        {({ errors, processing }) => (
                            <FormFeedback errors={errors}>
                                <PortalField label="Upstream student ID" name="student" required error={errors.student} announceError={false} />
                                <PortalField label="Existing LMS account email" name="account" type="email" required error={errors.account} announceError={false} />
                                <VerifiedRecord error={errors.verified}>I checked both identities against the registrar's record.</VerifiedRecord>
                                <Button className="justify-self-start" disabled={processing}>
                                    Link verified account
                                </Button>
                            </FormFeedback>
                        )}
                    </Form>
                </details>
            )}
            {manage && (
                <section className="min-w-0 space-y-3 rounded-lg border bg-card p-4 text-card-foreground sm:p-6">
                    <h2 className="text-xl font-semibold tracking-tight">Reconcile registrar feeds</h2>
                    <p>
                        Use an authorised upstream export. Corrections to official registration belong with the
                        registrar.
                    </p>
                    {(['registrations', 'profiles'] as const).map((kind) => (
                        <details key={kind} className="border-b py-3">
                            <summary className="cursor-pointer py-2 font-medium">Import {kind}</summary>
                            <p>
                                {kind === 'profiles'
                                    ? 'CSV or single-sheet XLSX: student_id, matric_number, name, email, programme, level, session, status. The optional photo column accepts a JPEG data URL up to 256 KiB and 1024 × 1024 pixels. Blank leaves the existing photo unchanged.'
                                    : 'CSV: student_id, offering_id, status, revision. Replayed rows are ignored.'}
                            </p>
                            <Form action={`/students/feeds/${kind}`} method="post">
                                {({ processing, errors }) => (
                                    <>
                                        <PortalField label="Registrar export" type="file" name="feed"
                                            accept={kind === 'profiles' ? '.csv,.xlsx' : '.csv'} required error={errors.feed} />
                                        <Button
                                            disabled={processing}
                                        >
                                            Reconcile {kind}
                                        </Button>
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
