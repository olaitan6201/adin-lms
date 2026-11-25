import { Head, Link } from '@inertiajs/react';
import './Learning/course.css';

export type CourseSummary = {
    id: string;
    external_offering_id: string;
    title: string | null;
    code: string | null;
    status: string;
    section: string | null;
    delivery_mode: string | null;
};

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
        <main className="syllabus">
            <Head title="My courses" />
            <header className="syllabus-title">
                <p className="syllabus-kicker">Course catalogue</p>
                <h1>My courses</h1>
                <p>{courses.length} {courses.length === 1 ? 'offering' : 'offerings'} linked to your account</p>
            </header>
            <nav aria-label="Course shortcuts" className="mb-4 flex flex-wrap gap-4">
                {shortcuts.map(
                    ({ href, label }) =>
                        href && (
                            <Link key={href} href={href} className="underline">
                                {label}
                            </Link>
                        ),
                )}
            </nav>
            {courses.length === 0 && (
                <p>No active course registrations are linked to your account.</p>
            )}
            <ul className="catalogue-list">
                {courses.map((course) => (
                    <li key={course.id}>
                        <small>{course.code || 'Course offering'} · {course.status}</small>
                        <Link href={`/courses/${course.id}`}>
                            {course.title || course.external_offering_id}
                        </Link>
                        <p>{[course.external_offering_id, course.section && `Section ${course.section}`, course.delivery_mode].filter(Boolean).join(' · ')}</p>
                    </li>
                ))}
            </ul>
            <Link as="button" method="post" href="/logout" className="mt-8 underline">
                Sign out
            </Link>
        </main>
    );
}
