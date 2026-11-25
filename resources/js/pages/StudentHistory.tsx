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
        <main className="mx-auto w-full min-w-0 max-w-6xl space-y-6 wrap-anywhere px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Academic history" />
            <Link className="font-medium text-primary underline underline-offset-4" href="/courses">
                My courses
            </Link>
            <header className="min-w-0 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Student record</p>
                <h1 className="break-words text-3xl font-semibold tracking-tight">Academic history</h1>
                {student.photo && (
                    <img
                        src={student.photo}
                        className="h-24 w-24 rounded object-cover"
                        alt="Student profile photograph"
                    />
                )}
                <p className="break-words">
                    {[student.source_name, student.matric_number, student.source_email, student.status]
                        .filter(Boolean)
                        .join(' · ') || 'Awaiting student profile.'}
                </p>
            </header>
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                <section className="min-w-0 space-y-3 rounded-lg border bg-card p-4 text-card-foreground sm:p-6">
                    <h2 className="text-xl font-semibold tracking-tight">Academic sessions</h2>
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
                </section>
                <section>
                    <h2 className="text-xl font-semibold tracking-tight">Offerings and released results</h2>
                    {records.length ? (
                        <ul className="divide-y">
                            {records.map((r) => (
                                <li key={r.id} className="py-3">
                                    <p className="text-sm font-medium text-muted-foreground break-words">
                                        {r.external_offering_id} · {r.status}
                                    </p>
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
                </section>
            </div>
        </main>
    );
}
