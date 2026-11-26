import type { CourseSummary } from '@/components/learning/contracts';
import { ArrowRight } from 'lucide-react';
import { CourseHeader } from '@/components/learning/CourseHeader';
import { Head, Link } from '@inertiajs/react';

type CoursesProps = {
    courses: CourseSummary[];
    historyUrl: string | null;
    staffUrl: string | null;
    workloadUrl: string | null;
};

export default function Courses({ courses, historyUrl, staffUrl, workloadUrl }: CoursesProps) {
    const shortcuts = [
        { label: 'My profile', href: '/profile' },
        { label: 'Academic history', href: historyUrl },
        { label: 'Manage lecturers', href: staffUrl },
        { label: 'My teaching workload', href: workloadUrl },
    ];

    return (
        <main className="course-page">
            <Head title="My courses" />
            <CourseHeader
                eyebrow={workloadUrl ? 'Teaching' : 'Learning'}
                title="My courses"
                description={
                    <p>
                        {courses.length} {courses.length === 1 ? 'offering' : 'offerings'} linked to your account
                    </p>
                }
                actions={
                    <nav aria-label="Course shortcuts">
                        {shortcuts.map(
                            ({ href, label }) =>
                                href && (
                                    <Link key={href} href={href} className="course-action">
                                        {label}
                                    </Link>
                                ),
                        )}
                    </nav>
                }
            />
            {courses.length === 0 ? (
                <p className="course-panel course-pad">No active course registrations are linked to your account.</p>
            ) : workloadUrl ? (
                <section className="course-panel">
                    <div className="course-panel-head">
                        <h2>Course offerings</h2>
                        <span className="course-tag">{courses.length} total</span>
                    </div>
                    <div className="course-table-scroll" tabIndex={0} role="region" aria-label="Course offerings">
                        <table className="course-table">
                            <thead>
                                <tr>
                                    {['Course', 'Section', 'Mode', 'State', 'Workspace'].map((label) => (
                                        <th scope="col" key={label}>
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td>
                                            <strong>{course.title || course.external_offering_id}</strong>
                                            <p className="course-code">
                                                {[course.code, course.external_offering_id].filter(Boolean).join(' · ')}
                                            </p>
                                        </td>
                                        <td>{course.section || '—'}</td>
                                        <td>{course.delivery_mode || '—'}</td>
                                        <td>
                                            <span className="course-tag">{course.status}</span>
                                        </td>
                                        <td>
                                            <Link
                                                className="course-action"
                                                href={`/courses/${course.id}`}
                                                aria-label={`Open ${course.title || course.external_offering_id}`}
                                            >
                                                Workspace
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : (
                <ul className="course-catalogue">
                    {courses.map((course) => (
                        <li key={course.id}>
                            <article className="course-panel course-pad course-offering">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="course-code">{course.code || course.external_offering_id}</p>
                                        <h2>{course.title || course.external_offering_id}</h2>
                                        <p className="course-detail">
                                            {[course.external_offering_id, course.section && `Section ${course.section}`]
                                                .filter(Boolean)
                                                .join(' · ')}
                                        </p>
                                    </div>
                                    {course.delivery_mode && <span className="course-tag">{course.delivery_mode}</span>}
                                </div>
                                <footer>
                                    <span className="course-tag">{course.status}</span>
                                    <Link
                                        className="course-action primary"
                                        href={`/courses/${course.id}`}
                                        aria-label={`Continue: ${course.title || course.external_offering_id}`}
                                    >
                                        Continue <ArrowRight aria-hidden />
                                    </Link>
                                </footer>
                            </article>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
