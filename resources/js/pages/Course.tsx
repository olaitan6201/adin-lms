import type { OfferingStatus } from '../components/academics/workflow';
import { Head, Link } from '@inertiajs/react';
import type { CourseSummary } from './Courses';

type Props = {
    course: CourseSummary & {
        title: string | null;
        status: OfferingStatus;
        section: string | null;
        delivery_mode: string | null;
    };
    teaching: boolean;
    modules: {
        id: string;
        title: string;
        body: string | null;
        kind: string;
    }[];
};

export default function Course({ course, teaching, modules }: Props) {
    const visible = teaching || course.status === 'published';

    return (
        <main className="mx-auto max-w-2xl space-y-4 px-6 py-16">
            <Head title={course.title || course.external_offering_id} />
            <Link href="/courses" className="underline">
                My courses
            </Link>
            <h1 className="text-3xl font-semibold">{course.title || course.external_offering_id}</h1>
            <p>
                {course.external_offering_id}
                {course.section && ` · Section ${course.section}`}
                {course.delivery_mode && ` · ${course.delivery_mode}`}
            </p>
            <p>
                {teaching && 'Lecturer view · '}Status: {course.status}
            </p>
            <nav aria-label="Course tools" className="flex flex-wrap gap-4">
                <Link href={`/community/courses/${course.id}`} className="underline">
                    Course board
                </Link>
                {visible && (
                    <>
                        <Link href={`/courses/${course.id}/learning`} className="underline">
                            Lessons and materials
                        </Link>
                        <Link href={`/courses/${course.id}/assessments`} className="underline">
                            Assessments
                        </Link>
                    </>
                )}
            </nav>
            {!visible && (
                <p>
                    {course.status === 'archived'
                        ? 'This offering is archived.'
                        : 'Course materials have not been published yet.'}
                </p>
            )}
            {visible && (
                <section>
                    <h2 className="text-xl font-semibold">Course modules</h2>
                    {modules.length ? (
                        <ol>
                            {modules.map((m) => (
                                <li key={m.id} className="border-b py-3">
                                    <h3 className="font-semibold">{m.title}</h3>
                                    <p className="whitespace-pre-wrap">{m.body}</p>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p>No modules available.</p>
                    )}
                </section>
            )}
        </main>
    );
}
