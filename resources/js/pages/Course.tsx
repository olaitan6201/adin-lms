import { NextCourseActivity } from './Learning/NextCourseActivity';
import { CourseTools } from './Learning/CourseTools';
import { CourseActivityList } from '../components/CourseActivityList';
import { Head, Link } from '@inertiajs/react';
import type { CourseSummary } from './Courses';
import { TeachingOutline } from './Learning/TeachingOutline';
import { CourseHeader } from './Learning/CourseHeader';
import { Eye, MessageSquare, Plus } from 'lucide-react';

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
        <main className="course-page">
            <Head title={title} />
            <Link className="underline" href="/courses">
                ← My courses
            </Link>
            <CourseHeader
                eyebrow={`${course.code || course.external_offering_id} · ${teaching ? 'Teaching workspace' : 'Course overview'}`}
                title={title}
                description={
                    <>
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
                    </>
                }
                actions={
                    <nav aria-label="Course actions">
                        {teaching ? (
                            <>
                                <Link className="course-action" href={`${base}/learning?preview=1`}>
                                    <Eye aria-hidden />
                                    Preview as student
                                </Link>
                                <Link className="course-action primary" href={`${base}/learning`}>
                                    <Plus aria-hidden />
                                    Add content
                                </Link>
                            </>
                        ) : (
                            <Link href={`/community/courses/${course.id}`} className="course-action">
                                <MessageSquare aria-hidden />
                                Ask a question
                            </Link>
                        )}
                    </nav>
                }
            />
            <CourseTools
                id={course.id}
                visible={visible}
                teaching={teaching}
                tools={learningToolsUrl}
                readings={packageReadingsUrl}
            />
            <div className={teaching ? 'course-reader course-teaching' : 'course-reader'}>
                <div className="space-y-4">
                    {!teaching && visible && activities.length > 0 && (
                        <nav aria-label="Course sequence" className="course-panel">
                            <div className="course-panel-head">
                                <h2>Course outline</h2>
                                <span className="course-tag">{activities.length}</span>
                            </div>
                            <CourseActivityList activities={activities} />
                        </nav>
                    )}
                    {teaching && (
                        <TeachingOutline base={base} draft={course.status === 'draft'} activities={activities} />
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
                        <div className="course-panel">
                            <CourseActivityList activities={activities} />
                        </div>
                    ) : null}
                </div>
                <div className="space-y-5">
                    {visible && !teaching && <NextCourseActivity activities={activities} />}
                    <aside className="course-panel course-pad space-y-4">
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
                    </aside>
                </div>
            </div>
        </main>
    );
}
