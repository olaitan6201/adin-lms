import { CourseActivityList } from '../components/CourseActivityList';
import { Head, Link } from '@inertiajs/react';
import type { CourseSummary } from './Courses';
import './Learning/course.css';
import '../insights/weekline.css';
import { SequenceEditor } from './Learning/SequenceEditor';

export interface Activity {
    id: string;
    type: string;
    title: string;
    detail: string;
    href: string;
    at?: string | null;
    dateLabel?: string;
    complete?: boolean;
    actionable?: boolean;
}

interface Props {
    course: CourseSummary & {
        description: string | null;
        credits: string | null;
    };
    teaching: boolean;
    learningToolsUrl: string;
    packageReadingsUrl: string | null;
    activities: Activity[];
    lecturers: string[];
    outcomes: string[];
}

export default function Course({
    course,
    teaching,
    activities,
    lecturers,
    outcomes,
    learningToolsUrl,
    packageReadingsUrl,
}: Props) {
    const visible = teaching || course.status === 'published';
    const title = course.title || course.external_offering_id;
    const lessons = activities.filter((a) => a.type === 'Lesson');
    const next = activities.find((a) => (a.type === 'Lesson' && !a.complete) || a.actionable);
    const completed = lessons.filter((a) => a.complete).length;
    const base = `/courses/${course.id}`;

    return (
        <main className={`portal-page syllabus${teaching ? '' : ' weekline'}`}>
            <Head title={title} />
            <Link className="syllabus-back" href="/courses">
                ← My courses
            </Link>
            <header className="syllabus-title">
                <p className="portal-kicker">
                    {course.code || course.external_offering_id} · {teaching ? 'Teaching workspace' : 'Course overview'}
                </p>
                <h1 className="portal-title">{title}</h1>
                {course.description && <p>{course.description}</p>}
                <p className="syllabus-meta">
                    {[
                        course.section && `Section ${course.section}`,
                        course.delivery_mode,
                        course.credits && `${Number(course.credits)} credits`,
                        course.status,
                    ]
                        .filter(Boolean)
                        .join(' · ')}
                </p>
            </header>
            {!teaching && visible && activities.length > 0 && (
                <nav aria-label="Course sequence">
                    <h2>Course outline</h2>
                    <CourseActivityList activities={activities} />
                </nav>
            )}
            <div className="syllabus-grid wl-course-grid">
                <div>
                    {visible && !teaching && (lessons.length > 0 || next) && (
                        <section className="wl-focus">
                            <p className="wl-label">{next ? `Up next / ${next.type}` : 'Progress'}</p>
                            <h2>{next?.title ?? 'Reading complete'}</h2>
                            {lessons.length > 0 && (
                                <>
                                    <p>
                                        {completed} of {lessons.length} available lessons complete
                                    </p>
                                    <progress
                                        aria-label="Available lessons completed"
                                        max={lessons.length}
                                        value={completed}
                                    />
                                </>
                            )}
                            {next && <Link className="wl-button" href={next.href}>Open {next.type.toLowerCase()} →</Link>}
                        </section>
                    )}
                    {teaching && <h2>Course outline</h2>}
                    {teaching && course.status === 'draft' && (
                        <p>
                            <Link href={`${base}/learning/teaching-plan`}>Teaching plan and academic review</Link>
                        </p>
                    )}
                    {teaching && <Link href={`${base}/learning?compose=overview`}>Draft a course introduction</Link>}
                    {teaching && activities.length > 1 && (
                        <SequenceEditor
                            key={activities.map((a) => a.id).join(',')}
                            activities={activities}
                            action={`${base}/learning/sequence`}
                        />
                    )}
                    {!visible ? (
                        <p>
                            {course.status === 'archived'
                                ? 'This offering is archived.'
                                : 'Course materials have not been published yet.'}
                        </p>
                    ) : !activities.length ? (
                        <p>No activities available yet.</p>
                    ) : teaching ? (
                        <CourseActivityList activities={activities} />
                    ) : null}
                </div>
                <aside className={teaching ? undefined : 'wl-panel'}>
                    <h2>Course information</h2>
                    <h3>Teaching team</h3>
                    <p>{lecturers.join(', ') || 'No lecturer listed yet.'}</p>
                    {outcomes.length > 0 && (
                        <>
                            <h3>Learning outcomes</h3>
                            <ul>
                                {outcomes.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </>
                    )}
                    <nav aria-label="Course tools">
                        <h3>{teaching ? 'Authoring and delivery' : 'Course tools'}</h3>
                        {visible && (
                            <>
                                <Link href={`${base}/learning`}>
                                    {teaching ? 'Author or preview lessons' : 'Lessons and materials'}
                                </Link>
                                <Link href={`${base}/learning/classes`}>Classroom and attendance</Link>
                                <Link href={`${base}/assessments`}>Assessments</Link>
                                <Link href={learningToolsUrl}>Library and learning tools</Link>
                                {packageReadingsUrl && <a href={packageReadingsUrl}>Packaged readings</a>}
                            </>
                        )}
                        <Link href={`/community/courses/${course.id}`}>Course board</Link>
                    </nav>
                </aside>
            </div>
        </main>
    );
}
