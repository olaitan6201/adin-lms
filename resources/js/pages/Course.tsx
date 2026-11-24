import { Head, Link } from '@inertiajs/react';
import type { CourseSummary } from './Courses';

export default function Course({ course }: { course: CourseSummary }) {
    return (
        <main className="mx-auto max-w-2xl px-6 py-16">
            <Head title={course.external_offering_id} />
            <Link href="/courses" className="underline">My courses</Link>
            <h1 className="my-4 text-3xl font-semibold">{course.external_offering_id}</h1>
            <p>Course materials have not been published yet.</p>
        </main>
    );
}
