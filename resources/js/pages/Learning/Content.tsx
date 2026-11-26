import { LessonNavigation } from '@/components/learning/LessonNavigation';
import { CourseHeader } from '@/components/learning/CourseHeader';
import { Head, Link } from '@inertiajs/react';
import { LessonForm } from '@/components/learning/LessonForm';
import type { Workspace, Lesson, Choice } from '@/components/learning/contracts';

import { ReadingLesson } from '@/components/learning/ReadingLesson';

interface ContentProps extends Workspace {
    lessons: Lesson[];
    lessonKinds: string[];
    quizzes: Choice[];
    preview: boolean;
    canTeach: boolean;
    overview: string;
    startOverview: boolean;
}

export default function Content({
    base,
    title,
    staff,
    lessons,
    lessonKinds,
    quizzes,
    preview,
    canTeach,
    overview,
    startOverview,
}: ContentProps) {
    return (
        <main className="course-page">
            <Head title={`${title} · Lessons`} />
            <CourseHeader
                eyebrow={title}
                title="Lessons and resources"
                description={preview && <p>Learner preview · Only currently released lessons and resources appear.</p>}
                actions={
                    <nav aria-label="Learning navigation">
                        <Link className="course-action" href={overview}>
                            Course overview
                        </Link>
                        <Link className="course-action" href={`${base}/classes`}>
                            Classroom & attendance
                        </Link>
                        {canTeach && (
                            <Link className="course-action" href={preview ? base : `${base}?preview=1`}>
                                {preview ? 'Return to authoring' : 'Preview learner visibility'}
                            </Link>
                        )}
                    </nav>
                }
            />
            {staff && (
                <LessonForm
                    key={lessons.at(-1)?.position ?? 0}
                    startOverview={startOverview}
                    lessons={lessons}
                    lessonKinds={lessonKinds}
                    quizzes={quizzes}
                    base={base}
                    position={(lessons.at(-1)?.position || 0) + 1}
                />
            )}
            {!lessons.length && <p className="course-panel course-pad">No lessons are available yet.</p>}
            {lessons.length > 0 && (
                <div className="course-reader">
                    <LessonNavigation lessons={lessons} />
                    <div className="space-y-5">
                        {lessons.map((lesson) => (
                            <ReadingLesson
                                key={lesson.id}
                                {...{ base, staff, preview, lesson, lessons, lessonKinds, quizzes }}
                            />
                        ))}
                    </div>
                </div>
            )}
            {!staff && !preview && lessons.length > 0 && (
                <nav aria-label="Continue from reading">
                    <Link className="underline" href={overview}>
                        Return to course activities →
                    </Link>
                </nav>
            )}
        </main>
    );
}
