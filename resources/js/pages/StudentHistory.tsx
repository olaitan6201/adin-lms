import { Head, Link } from '@inertiajs/react';

type Profile = Record<'matric_number' | 'source_name' | 'source_email' | 'status', string | null>;
type Session = { session: string; programme: string; level: string };
type Entry = { id: string; external_offering_id: string; title: string | null; status: string; result: { grade: string; total_percent: string | number } | null };

export default function StudentHistory({ student, sessions, records }: { student: Profile; sessions: Session[]; records: Entry[] }) {
    return <main className="mx-auto max-w-2xl space-y-5 px-6 py-12">
        <Head title="Academic history" />
        <Link className="underline" href="/courses">My courses</Link>
        <h1 className="text-3xl font-semibold">Academic history</h1>
        <p>{[student.source_name, student.matric_number, student.source_email, student.status].filter(Boolean).join(' · ') || 'Awaiting student profile.'}</p>
        <h2 className="text-xl font-semibold">Academic sessions</h2>
        {sessions.length ? <ul>{sessions.map(s => <li key={s.session}>{s.session}: {s.programme}, level {s.level}</li>)}</ul> : <p>No session records received.</p>}
        <h2 className="text-xl font-semibold">Offerings and released results</h2>
        {records.length ? <ul className="divide-y">{records.map(r => <li key={r.id} className="py-3">
            <strong>{r.title ?? r.external_offering_id}</strong> · {r.status}
            <p>{r.result ? `Released: ${Number(r.result.total_percent)}% (${r.result.grade})` : 'No released result'}</p>
        </li>)}</ul> : <p>No registrations received.</p>}
    </main>;
}
