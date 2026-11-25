import { Head, Link } from '@inertiajs/react';
import { ClassScheduleForm } from './ClassScheduleForm';
import { AttendanceForm } from './AttendanceForm';
import type { Choice, Workspace, Session, Participant } from './contracts';

interface ClassroomProps extends Workspace {
    overview: string;
    board: string;
    sessions: Session[];
    percentage: number | null;
    materials: Choice[];
    participants: Participant[];
    classStatuses: string[];
    attendanceStatuses: string[];
}
export default function Classroom({
    base,
    overview,
    board,
    title,
    staff,
    sessions,
    participants,
    percentage,
    materials,
    classStatuses,
    attendanceStatuses,
}: ClassroomProps) {
    return (
        <main className="portal-page mx-auto max-w-3xl space-y-5 px-5 py-10">
            <Head title={`${title} · Classroom`} />
            <nav aria-label="Classroom navigation" className="flex flex-wrap gap-4 underline">
                <Link href={overview}>Course overview</Link><Link href={base}>Lessons and resources</Link>
                <Link href={board}>Course announcements and questions</Link>
            </nav>
            <header>
                <p className="portal-kicker">{title}</p>
                <h1 className="portal-title">Classroom and attendance</h1>
            </header>
            <p>
                My attendance: {percentage === null ? 'No counted classes yet' : `${percentage}%`}
                . Counted classes are held sessions marked present or absent. Excused, cancelled and unmarked sessions do not lower your percentage.
            </p>
            {staff && (
                <ClassScheduleForm
                    statuses={classStatuses}
                    action={`${base}/classes`}
                    materials={materials}
                />
            )}
            {!sessions.length && <p>No classes scheduled.</p>}
            {sessions.map((s) => (
                <section key={s.id} id={`class-${s.id}`} className="space-y-2 border-t pt-4">
                    <h2 className="text-xl font-semibold">{s.title}</h2>
                    <p>
                        {new Date(s.starts_at).toLocaleString()} –{' '}
                        {new Date(s.ends_at).toLocaleString()} · {s.status}
                    </p>
                    <p>My register: {s.mark || 'Not marked'}</p>
                    {s.meeting_url && (
                        <p>
                            <a className="underline" href={s.meeting_url} rel="noreferrer">
                                Join class meeting
                            </a>
                        </p>
                    )}
                    {s.recording_material_id && (
                        <Link
                            className="underline"
                            href={`${base}#resource-${s.recording_material_id}`}
                        >
                            Recording or alternative
                        </Link>
                    )}
                    {staff && (
                        <>
                            <ClassScheduleForm
                                statuses={classStatuses}
                                action={`${base}/classes/${s.id}`}
                                session={s}
                                materials={materials}
                            />
                            {s.accepts_marks && (
                                <AttendanceForm
                                    statuses={attendanceStatuses}
                                    action={`${base}/classes/${s.id}/marks`}
                                    participants={participants}
                                />
                            )}
                            <a className="underline" href={`${base}/classes/${s.id}/register`}>
                                Export register (CSV)
                            </a>
                        </>
                    )}
                </section>
            ))}
        </main>
    );
}
