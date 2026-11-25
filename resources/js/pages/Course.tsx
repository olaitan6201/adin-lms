import { NextCourseActivity } from './Learning/NextCourseActivity';
import { Separator } from '@/components/ui/separator';
import { CourseActivityList } from '../components/CourseActivityList';
import { Head, Link } from '@inertiajs/react';
import type { CourseSummary } from './Courses';
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
    locked?: boolean;
    readingPreview?: string | null;
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
    const base = `/courses/${course.id}`;

    return (
        <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
            <Head title={title} />
            <Link className="underline" href="/courses">
                ← My courses
            </Link>
            <header className="space-y-2">
                <p className="text-sm text-muted-foreground">
                    {course.code || course.external_offering_id} · {teaching ? 'Teaching workspace' : 'Course overview'}
                </p>
                <h1 className="text-3xl font-semibold">{title}</h1>
                {course.description && <p>{course.description}</p>}
                <p className="text-sm text-muted-foreground">
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
            <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="min-w-0 space-y-4">
                    {visible && !teaching && <NextCourseActivity activities={activities} />}
                    {!teaching && visible && activities.length > 0 && (
                        <nav aria-label="Course sequence">
                            <h2 className="text-xl font-semibold">Course outline</h2>
                            <CourseActivityList activities={activities} />
                        </nav>
                    )}
                    {teaching && <h2 className="text-xl font-semibold">Course outline</h2>}
                    {teaching && course.status === 'draft' && (
                        <p>
                            <Link className="underline" href={`${base}/learning/teaching-plan`}>
                                Teaching plan and academic review
                            </Link>
                        </p>
                    )}
                    {teaching && (
                        <Link className="underline" href={`${base}/learning?compose=overview`}>
                            Draft a course introduction
                        </Link>
                    )}
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
                <aside className="min-w-0 space-y-4">
                    <h2 className="text-xl font-semibold">Course information</h2>
                    <h3 className="font-medium">Teaching team</h3>
                    <p>{lecturers.join(', ') || 'No lecturer listed yet.'}</p>
                    {outcomes.length > 0 && (
                        <>
                            <h3 className="font-medium">Learning outcomes</h3>
                            <ul className="list-disc pl-5">
                                {outcomes.map((s, i) => (
                                    <li key={i}>{s}</li>
                                ))}
                            </ul>
                        </>
                    )}
                    <Separator />
                    <nav aria-label="Course tools" className="grid justify-items-start gap-2">
                        <h3 className="font-medium">{teaching ? 'Authoring and delivery' : 'Course tools'}</h3>
                        {visible && (
                            <>
                                <Link className="underline" href={`${base}/learning`}>
                                    {teaching ? 'Author or preview lessons' : 'Lessons and materials'}
                                </Link>
                                <Link className="underline" href={`${base}/learning/classes`}>
                                    Classroom and attendance
                                </Link>
                                <Link className="underline" href={`${base}/assessments`}>
                                    Assessments
                                </Link>
                                <Link className="underline" href={learningToolsUrl}>
                                    Library and learning tools
                                </Link>
                                {packageReadingsUrl && (
                                    <a className="underline" href={packageReadingsUrl}>
                                        Packaged readings
                                    </a>
                                )}
                            </>
                        )}
                        <Link className="underline" href={`/community/courses/${course.id}`}>
                            Course board
                        </Link>
                    </nav>
                </aside>
            </div>
        </main>
    );
}
