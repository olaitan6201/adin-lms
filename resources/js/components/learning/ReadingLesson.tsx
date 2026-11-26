import { Badge } from '@/components/ui/badge';
import { LessonForm } from '@/components/learning/LessonForm';
import { ResourceForm } from '@/components/learning/ResourceForm';
import { EntryForm } from '@/components/learning/EntryForm';
import { Manuscript } from '@/components/learning/Manuscript';
import { ResourceReader } from '@/components/learning/ResourceReader';
import type { Lesson, Choice } from '@/components/learning/contracts';
import { manuscriptBlocks, resourceId } from './manuscriptBlocks';

type Props = {
    base: string;
    staff: boolean;
    preview: boolean;
    lesson: Lesson;
    lessons: Lesson[];
    lessonKinds: string[];
    quizzes: Choice[];
};

export function ReadingLesson({ base, staff, preview, lesson, lessons, lessonKinds, quizzes }: Props) {
    const prior = lesson.locked && lessons.find((item) => item.id === lesson.prerequisite_id);
    const rendered = new Set(manuscriptBlocks(lesson.body).map(resourceId));
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

    return (
        <section id={`lesson-${lesson.id}`} className="course-panel course-pad course-reading space-y-3">
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
                <EntryForm action={`${base}/lessons/${lesson.id}/complete`} label="Mark lesson complete" />
            )}
        </section>
    );
}
