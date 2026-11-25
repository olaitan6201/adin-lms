import { Head, Link } from '@inertiajs/react';
import { LessonForm } from './LessonForm';
import { ResourceForm } from './ResourceForm';
import { EntryForm } from './EntryForm';
import { Manuscript } from './Manuscript';
import { ResourceReader } from './ResourceReader';
import type { Workspace, Lesson, Choice } from './contracts';

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
        <main className="portal-page mx-auto max-w-3xl space-y-6 px-5 py-10">
            <Head title={`${title} · Lessons`} />
            <nav aria-label="Learning navigation" className="flex flex-wrap gap-5 underline">
                <Link href={overview}>Course overview</Link>
                <Link href={`${base}/classes`}>Classroom & attendance</Link>
                {canTeach && (
                    <Link href={preview ? base : `${base}?preview=1`}>
                        {preview ? 'Return to authoring' : 'Preview learner visibility'}
                    </Link>
                )}
            </nav>
            <header>
                <p className="portal-kicker">{title}</p>
                <h1 className="portal-title text-3xl font-semibold">Lessons and resources</h1>
                {preview && <p>Learner preview · Only currently released lessons and resources appear.</p>}
            </header>
            {staff && (
                <LessonForm
                    startOverview={startOverview}
                    lessonKinds={lessonKinds}
                    quizzes={quizzes}
                    base={base}
                    position={(lessons.at(-1)?.position || 0) + 1}
                />
            )}
            {!lessons.length && <p>No lessons are available yet.</p>}
            {lessons.map((lesson) => {
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
                    <section id={`lesson-${lesson.id}`} className="space-y-3 border-t pt-5" key={lesson.id}>
                        <p className="portal-kicker">
                            {!lesson.published && 'Draft · '}
                            {lesson.kind}
                        </p>
                        <h2 className="text-xl font-semibold">
                            {lesson.position}. {lesson.title}
                        </h2>
                        <Manuscript text={lesson.body} resource={resource} />
                        {lesson.materials.filter((m) => !rendered.has(m.id)).map((m) => resource(m.id))}
                        {staff ? (
                            <>
                                <LessonForm
                                    lessonKinds={lessonKinds}
                                    quizzes={quizzes}
                                    base={base}
                                    lesson={lesson}
                                    position={lesson.position}
                                />
                                <ResourceForm action={`${base}/lessons/${lesson.id}/materials`} />
                            </>
                        ) : preview ? null : lesson.completed_at ? (
                            <p>Completed {new Date(lesson.completed_at).toLocaleDateString()}</p>
                        ) : (
                            <EntryForm action={`${base}/lessons/${lesson.id}/complete`} label="Mark lesson complete" />
                        )}
                    </section>
                );
            })}
        </main>
    );
}
