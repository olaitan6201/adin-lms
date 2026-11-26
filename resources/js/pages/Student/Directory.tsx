import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { VerifiedRecord } from '@/components/shared/records/VerifiedRecord';
import { PortalField } from '@/components/forms/PortalForm';
import { FormFeedback } from '@/components/forms/FormFeedback';
import { Form, Head, Link } from '@inertiajs/react';
import { DeskHeading } from '@/components/academics/DeskHeading';
import { RegistryPanel, RegistryTable } from '@/components/academics/RegistryPanel';

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
        <main className="w-full min-w-0 space-y-5 wrap-anywhere">
            <Head title="Student records" />
            <DeskHeading area="Registrar" title="Student records">
                Find a student to inspect their academic history, including withdrawn registrations and released
                results.
            </DeskHeading>
            <RegistryPanel title="Student directory" subtitle="Registrar profiles and registration status">
            <Form action="/students" method="get" className="flex flex-wrap items-end gap-3 border-b border-ink-100 pb-4">
                <label className="grid gap-2 text-sm font-medium">
                    Find by name, matric number or upstream ID{' '}
                    <Input name="q" defaultValue={q} />
                </label>
                <Button>Search</Button>
            </Form>
            <RegistryTable title="Matching students" columns={['Student', 'Matric number', 'Status']}>
                {students.map((s) => (
                    <tr key={s.id}><td>
                        <Link className="text-primary underline underline-offset-4" href={`/students/${s.id}/history`}>
                            {s.source_name || s.external_student_id}
                        </Link>
                        </td><td className="font-mono">{s.matric_number || 'Awaiting matric number'}</td>
                        <td><span className="badge bg-ink-50 text-ink-700">{s.status || 'Awaiting profile'}</span></td>
                    </tr>
                ))}
            </RegistryTable>
            {!students.length && <p>No matching student records.</p>}
            {previous && <Link href={previous}>Previous page</Link>} {next && <Link href={next}>Next page</Link>}
            </RegistryPanel>
            {receipt && <p role="status">{receipt}</p>}
            {link && (
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                            Link a verified LMS account
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
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
                    </CollapsibleContent>
                </Collapsible>
            )}
            {manage && (
                <RegistryPanel title="Reconcile registrar feeds">
                    <p>
                        Use an authorised upstream export. Corrections to official registration belong with the
                        registrar.
                    </p>
                    {(['registrations', 'profiles'] as const).map((kind) => (
                        <Collapsible key={kind} className="border-b py-3">
                            <CollapsibleTrigger asChild>
                                <Button type="button" variant="outline" className="h-auto min-h-9 max-w-full whitespace-normal text-start">
                                    Import {kind}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent forceMount className="space-y-3 pt-3 data-[state=closed]:hidden">
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
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </RegistryPanel>
            )}
        </main>
    );
}
