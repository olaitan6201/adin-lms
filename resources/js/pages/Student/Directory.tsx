import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, Head, Link } from '@inertiajs/react';
import { DeskHeading } from '@/components/academics/DeskHeading';
import { RegistryPanel, RegistryTable } from '@/components/academics/RegistryPanel';
import { LinkStudentAccount } from '@/components/students/LinkStudentAccount';
import { ReconcileStudentFeeds } from '@/components/students/ReconcileStudentFeeds';

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
                Find a student to inspect their academic history, including withdrawn registrations and released results.
            </DeskHeading>
            <RegistryPanel title="Student directory" subtitle="Registrar profiles and registration status">
                <Form action="/students" method="get" className="flex flex-wrap items-end gap-3 border-b border-ink-100 pb-4">
                    <label className="grid gap-2 text-sm font-medium">
                        Find by name, matric number or upstream ID <Input name="q" defaultValue={q} />
                    </label>
                    <Button>Search</Button>
                </Form>
                <RegistryTable title="Matching students" columns={['Student', 'Matric number', 'Status']}>
                    {students.map((s) => (
                        <tr key={s.id}>
                            <td>
                                <Link className="text-primary underline underline-offset-4" href={`/students/${s.id}/history`}>
                                    {s.source_name || s.external_student_id}
                                </Link>
                            </td>
                            <td className="font-mono">{s.matric_number || 'Awaiting matric number'}</td>
                            <td>
                                <span className="badge bg-ink-50 text-ink-700">{s.status || 'Awaiting profile'}</span>
                            </td>
                        </tr>
                    ))}
                </RegistryTable>
                {!students.length && <p>No matching student records.</p>}
                {previous && <Link href={previous}>Previous page</Link>} {next && <Link href={next}>Next page</Link>}
            </RegistryPanel>
            {receipt && <p role="status">{receipt}</p>}
            {link && <LinkStudentAccount />}
            {manage && <ReconcileStudentFeeds />}
        </main>
    );
}
