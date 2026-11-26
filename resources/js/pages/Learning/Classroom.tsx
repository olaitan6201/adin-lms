import { CourseHeader } from './CourseHeader';
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
        <main className="course-page">
            <Head title={`${title} · Classroom`} />
            <CourseHeader
                eyebrow={title}
                title="Classroom and attendance"
                actions={
                    <nav aria-label="Classroom navigation">
                        <Link className="course-action" href={overview}>
                            Course overview
                        </Link>
                        <Link className="course-action" href={base}>
                            Lessons and resources
                        </Link>
                        <Link className="course-action" href={board}>
                            Course announcements and questions
                        </Link>
                    </nav>
                }
            />
            <p className="course-note">
                My attendance: {percentage === null ? 'No counted classes yet' : `${percentage}%`}. Counted classes are held
                sessions marked present or absent. Excused, cancelled and unmarked sessions do not lower your percentage.
            </p>
            {staff && <ClassScheduleForm statuses={classStatuses} action={`${base}/classes`} materials={materials} />}
            <section className="course-panel">
                <div className="course-panel-head">
                    <h2>Scheduled classes</h2>
                    <span className="course-tag">{sessions.length} sessions</span>
                </div>
                {!sessions.length ? (
                    <p className="course-pad">No classes scheduled.</p>
                ) : (
                    <div className="course-table-scroll" role="region" aria-label="Scheduled classes" tabIndex={0}>
                        <table className="course-table">
                            <thead>
                                <tr>
                                    {['Session', 'Starts', 'Ends', 'State', 'My register'].map((heading) => (
                                        <th key={heading} scope="col">
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((s) => (
                                    <tr key={s.id}>
                                        <td>
                                            <a className="font-medium underline" href={`#class-${s.id}`}>
                                                {s.title}
                                            </a>
                                        </td>
                                        <td>{new Date(s.starts_at).toLocaleString()}</td>
                                        <td>{new Date(s.ends_at).toLocaleString()}</td>
                                        <td>
                                            <span className="course-tag">{s.status}</span>
                                        </td>
                                        <td>{s.mark || 'Not marked'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
            {sessions.map((s) => (
                <section key={s.id} id={`class-${s.id}`} className="course-panel course-pad course-reading space-y-3">
                    <h2 className="text-xl font-semibold">{s.title}</h2>
                    <p>
                        {new Date(s.starts_at).toLocaleString()} – {new Date(s.ends_at).toLocaleString()} · {s.status}
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
                        <Link className="underline" href={`${base}#resource-${s.recording_material_id}`}>
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
