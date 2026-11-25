import { Head, Link } from '@inertiajs/react';

export type CourseSummary = {
    id: string;
    external_offering_id: string;
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
        <main className="mx-auto max-w-2xl px-6 py-16">
            <Head title="My courses" />
            <h1 className="mb-4 text-3xl font-semibold">My courses</h1>
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
            <ul className="space-y-3">
                {courses.map((course) => (
                    <li key={course.id}>
                        <Link className="underline" href={`/courses/${course.id}`}>
                            {course.external_offering_id}
                        </Link>
                    </li>
                ))}
            </ul>
            <Link as="button" method="post" href="/logout" className="mt-8 underline">
                Sign out
            </Link>
        </main>
    );
}
