import { Head, Link } from '@inertiajs/react';
import { DeskHeading } from '@/components/academics/DeskHeading';
import { RegistryPanel, RegistryTable } from '@/components/academics/RegistryPanel';

type Profile = Record<'matric_number' | 'source_name' | 'source_email' | 'status' | 'photo', string | null>;
type Session = {
    session: string;
    programme: string;
    department: string;
    faculty: string;
    level: string;
};

type Entry = {
    id: string;
    external_offering_id: string;
    title: string | null;
    status: string;
    result: {
        grade: string;
        total_percent: string | number;
    } | null;
};

function RegistrationHistory({ records }: { records: Entry[] }) {
    return (
        <RegistryPanel title="Offerings and released results">
            {records.length ? (
                <RegistryTable title="Registrations" columns={['Offering', 'Status', 'Released result']}>
                    {records.map((r) => (
                        <tr key={r.id}>
                            <td>
                                <span className="block font-mono text-xs">{r.external_offering_id}</span>
                                {r.title && <strong>{r.title}</strong>}
                            </td>
                            <td>{r.status}</td>
                            <td>{r.result ? `Released: ${r.result.total_percent}% (${r.result.grade})` : 'No released result'}</td>
                        </tr>
                    ))}
                </RegistryTable>
            ) : (
                <p>No registrations received.</p>
            )}
        </RegistryPanel>
    );
}

export default function StudentHistory({ student, sessions, records }: {
    student: Profile;
    sessions: Session[];
    records: Entry[]
}) {
    return (
        <main className="w-full min-w-0 space-y-5 wrap-anywhere">
            <Head title="Academic history" />
            <Link className="font-medium text-primary underline underline-offset-4" href="/courses">
                My courses
            </Link>
            <DeskHeading area="Student record" title="Academic history">
                {student.photo && <img src={student.photo} className="h-24 w-24 rounded object-cover" alt="Student profile photograph" />}
                <p className="break-words">
                    {[student.source_name, student.matric_number, student.source_email, student.status].filter(Boolean).join(' · ') ||
                        'Awaiting student profile.'}
                </p>
            </DeskHeading>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <RegistryPanel title="Academic sessions">
                    {sessions.length ? (
                        <ul>
                            {sessions.map((s) => (
                                <li key={s.session} className="py-3">
                                    <p className="text-sm font-medium text-muted-foreground">{s.session}</p>
                                    <strong>{s.programme}</strong>
                                    <p>
                                        Level {s.level} · {s.department}, {s.faculty}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No session records received.</p>
                    )}
                </RegistryPanel>
                <RegistrationHistory records={records} />
            </div>
        </main>
    );
}
