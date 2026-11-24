import { Head, Link } from '@inertiajs/react';

export type CourseSummary = { id: string; external_offering_id: string };

export default function Courses({ courses, historyUrl }: { courses: CourseSummary[]; historyUrl: string | null }) {
    return (
        <main className="mx-auto max-w-2xl px-6 py-16">
            <Head title="My courses" />
            <h1 className="mb-4 text-3xl font-semibold">My courses</h1>
            <Link className="mb-4 inline-block underline" href="/profile">My profile</Link>
            {historyUrl && <Link className="ml-4 underline" href={historyUrl}>Academic history</Link>}
            {courses.length === 0 && <p>No active course registrations are linked to your account.</p>}
            <ul className="space-y-3">
                {courses.map(course => <li key={course.id}><Link className="underline" href={`/courses/${course.id}`}>{course.external_offering_id}</Link></li>)}
            </ul>
            <Link as="button" method="post" href="/logout" className="mt-8 underline">Sign out</Link>
        </main>
    );
}
