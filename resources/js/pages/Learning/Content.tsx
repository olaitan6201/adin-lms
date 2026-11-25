import { Head, Link } from '@inertiajs/react';
import { LessonForm } from './LessonForm';
import { ResourceForm } from './ResourceForm';
import { EntryForm } from './EntryForm';
import { ExternalResource } from './ExternalResource';
import type { Workspace, Lesson } from './contracts';

interface ContentProps extends Workspace {
    lessons: Lesson[];
    lessonKinds: string[];
}

export default function Content({ base, title, staff, lessons, lessonKinds }: ContentProps) {
    return (
        <main className="mx-auto max-w-3xl space-y-6 px-5 py-10">
            <Head title={`${title} · Lessons`} />
            <nav className="flex gap-5 underline">
                <Link href="/courses">Courses</Link>
                <Link href={`${base}/classes`}>Classroom & attendance</Link>
            </nav>
            <header>
                <p>{title}</p>
                <h1 className="text-3xl font-semibold">Lessons and resources</h1>
            </header>
            {staff && (
                <LessonForm
                    lessonKinds={lessonKinds}
                    base={base}
                    position={(lessons.at(-1)?.position || 0) + 1}
                />
            )}
            {!lessons.length && <p>No lessons are available yet.</p>}
            {lessons.map((lesson) => (
                <section id={`lesson-${lesson.id}`} className="space-y-3 border-t pt-5" key={lesson.id}>
                    <p>
                        {!lesson.published && 'Draft · '}
                        {lesson.kind}
                    </p>
                    <h2 className="text-xl font-semibold">
                        {lesson.position}. {lesson.title}
                    </h2>
                    <p className="whitespace-pre-wrap">{lesson.body}</p>
                    {lesson.materials.map((m) => (
                        <article
                            key={m.id}
                            id={`resource-${m.id}`}
                            className="space-y-2 border-l-2 pl-4"
                        >
                            <h3 className="font-semibold">{m.title}</h3>
                            {m.versions.map((v) => (
                                <div key={v.revision}>
                                    <small>
                                        Revision {v.revision}
                                        {v.author && ` · ${v.author}`}
                                    </small>
                                    <p className="whitespace-pre-wrap">{v.body}</p>
                                    {v.image && (
                                        <img
                                            loading="lazy"
                                            className="max-w-full"
                                            src={v.image}
                                            alt={m.title}
                                        />
                                    )}
                                    {v.external_url && (
                                        <ExternalResource href={v.external_url} title={m.title} />
                                    )}
                                    {v.download && (
                                        <a className="underline" href={v.download}>
                                            Download {m.title} (revision {v.revision})
                                        </a>
                                    )}
                                </div>
                            ))}
                            {staff && (
                                <ResourceForm
                                    action={`${base}/lessons/${lesson.id}/materials/${m.id}`}
                                    item={m}
                                />
                            )}
                        </article>
                    ))}
                    {staff ? (
                        <>
                            <LessonForm
                                lessonKinds={lessonKinds}
                                base={base}
                                lesson={lesson}
                                position={lesson.position}
                            />
                            <ResourceForm action={`${base}/lessons/${lesson.id}/materials`} />
                        </>
                    ) : lesson.completed_at ? (
                        <p>Completed {new Date(lesson.completed_at).toLocaleDateString()}</p>
                    ) : (
                        <EntryForm
                            action={`${base}/lessons/${lesson.id}/complete`}
                            label="Mark lesson complete"
                        />
                    )}
                </section>
            ))}
        </main>
    );
}
