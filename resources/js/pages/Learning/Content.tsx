import { LessonNavigation } from '@/components/learning/LessonNavigation';
import { CourseHeader } from '@/components/learning/CourseHeader';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { LessonForm } from '@/components/learning/LessonForm';
import { ResourceForm } from '@/components/learning/ResourceForm';
import { EntryForm } from '@/components/learning/EntryForm';
import { Manuscript } from '@/components/learning/Manuscript';
import { ResourceReader } from '@/components/learning/ResourceReader';
import type { Workspace, Lesson, Choice } from '@/components/learning/contracts';

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
                        {lessons.map((lesson) => {
                            const prior = lesson.locked && lessons.find((item) => item.id === lesson.prerequisite_id);
                            const rendered = new Set<string>();
                            const resource = (id: string) => {
                                const material = lesson.materials.find((m) => m.id === id);
                                return (
                                    material && (
                                        <ResourceReader
                                            key={id}
                                            material={material}
                                            action={staff ? `${base}/lessons/${lesson.id}/materials/${id}` : undefined}
                                        />
                                    )
                                );
                            };

                            for (const block of (lesson.body || '')
                                .replace(/\r\n/g, '\n')
                                .trim()
                                .split(/\n\s*\n/)) {
                                const match = /^\{\{resource:([a-f0-9-]{36})\}\}$/.exec(block);
                                if (match) rendered.add(match[1]);
                            }

                            return (
                                <section
                                    id={`lesson-${lesson.id}`}
                                    className="course-panel course-pad course-reading space-y-3"
                                    key={lesson.id}
                                >
                                    <Badge variant="secondary">
                                        {!lesson.published && 'Draft · '}
                                        {lesson.kind}
                                    </Badge>
                                    <h2 className="text-xl font-semibold">
                                        {lesson.position}. {lesson.title}
                                    </h2>
                                    {lesson.locked ? (
                                        <p>
                                            Locked ·{' '}
                                            {prior ? (
                                                <>
                                                    Complete{' '}
                                                    <a className="underline" href={`#lesson-${prior.id}`}>
                                                        {prior.title}
                                                    </a>{' '}
                                                    first.
                                                </>
                                            ) : (
                                                'The required earlier lesson is not currently available.'
                                            )}
                                        </p>
                                    ) : (
                                        <Manuscript text={lesson.body} resource={resource} />
                                    )}
                                    {lesson.materials.filter((m) => !rendered.has(m.id)).map((m) => resource(m.id))}
                                    {staff ? (
                                        <>
                                            <LessonForm
                                                lessonKinds={lessonKinds}
                                                lessons={lessons}
                                                quizzes={quizzes}
                                                base={base}
                                                lesson={lesson}
                                                position={lesson.position}
                                            />
                                            <ResourceForm action={`${base}/lessons/${lesson.id}/materials`} />
                                        </>
                                    ) : preview || lesson.locked ? null : lesson.completed_at ? (
                                        <p>Completed {new Date(lesson.completed_at).toLocaleDateString()}</p>
                                    ) : (
                                        <EntryForm
                                            action={`${base}/lessons/${lesson.id}/complete`}
                                            label="Mark lesson complete"
                                        />
                                    )}
                                </section>
                            );
                        })}
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
