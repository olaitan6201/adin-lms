import { EntryForm } from './EntryForm';
import { useState } from 'react';
import { AvailabilityFields } from './AvailabilityFields';
import type { Choice, Lesson } from './contracts';
import { ManuscriptEditor } from './ManuscriptEditor';

export function LessonForm({
    base,
    lesson,
    position,
    lessons,
    lessonKinds,
    quizzes,
    startOverview = false,
}: {
    base: string;
    lesson?: Lesson;
    position: number;
    lessons: Lesson[];
    lessonKinds: string[];
    quizzes: Choice[];
    startOverview?: boolean;
}) {
    const [order, setOrder] = useState(position);
    return (
        <details open={startOverview || undefined}>
            <summary>{lesson ? 'Edit lesson or publish' : 'Author a lesson'}</summary>
            <EntryForm action={`${base}/lessons${lesson ? `/${lesson.id}` : ''}`} label="Save lesson">
                <label>
                    Title
                    <input name="title" required maxLength={191} defaultValue={lesson?.title} />
                </label>
                <label>
                    Order
                    <input type="number" min="1" name="position" required defaultValue={position}
                        onChange={(event) => setOrder(event.currentTarget.valueAsNumber)} />
                </label>
                <label>
                    Require completion of
                    <select name="prerequisite_id" defaultValue={lesson?.prerequisite_id ?? ''}>
                        <option value="">No prior lesson</option>
                        {lessons.filter((prior) => prior.id !== lesson?.id && prior.position < order).map((prior) => (
                            <option key={prior.id} value={prior.id}>{prior.position}. {prior.title}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Organisation
                    <select name="kind" defaultValue={lesson?.kind ?? (startOverview ? 'overview' : undefined)}>
                        {lessonKinds.map((k) => (
                            <option key={k}>{k}</option>
                        ))}
                    </select>
                </label>
                <ManuscriptEditor lesson={lesson} quizzes={quizzes} />
                <label>
                    Publication
                    <select name="published" defaultValue={lesson?.published ? '1' : '0'}>
                        <option value="0">Draft</option>
                        <option value="1">Publish</option>
                    </select>
                </label>
                <AvailabilityFields item={lesson} />
            </EntryForm>
        </details>
    );
}
