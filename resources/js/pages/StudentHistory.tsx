import { Head, Link } from '@inertiajs/react';

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

export default function StudentHistory({
    student,
    sessions,
    records,
}: {
    student: Profile;
    sessions: Session[];
    records: Entry[];
}) {
    return (
        <main className="portal-page">
            <Head title="Academic history" />
            <Link className="desk-link" href="/courses">
                My courses
            </Link>
            <header className="desk-heading"><p className="portal-kicker">Student record</p>
            <h1 className="portal-title">Academic history</h1>
            {student.photo && <img src={student.photo} className="h-24 w-24 rounded object-cover" alt="Student profile photograph" />}
            <p className="break-words">
                {[student.source_name, student.matric_number, student.source_email, student.status]
                    .filter(Boolean)
                    .join(' · ') || 'Awaiting student profile.'}
            </p></header>
            <div className="desk-grid"><section className="portal-panel desk-shelf"><h2 className="desk-section">Academic sessions</h2>
            {sessions.length ? (
                <ul>
                    {sessions.map((s) => (
                        <li key={s.session} className="py-3">
                            <p className="portal-kicker">{s.session}</p><strong>{s.programme}</strong>
                            <p>Level {s.level} · {s.department}, {s.faculty}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No session records received.</p>
            )}
            </section><section><h2 className="desk-section">Offerings and released results</h2>
            {records.length ? (
                <ul className="divide-y">
                    {records.map((r) => (
                        <li key={r.id} className="py-3">
                            <p className="portal-kicker break-words">{r.external_offering_id} · {r.status}</p>
                            {r.title && <strong>{r.title}</strong>}
                            <p>
                                {r.result
                                    ? `Released: ${r.result.total_percent}% (${r.result.grade})`
                                    : 'No released result'}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No registrations received.</p>
            )}
            </section></div>
        </main>
    );
}
