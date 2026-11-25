import { EntryForm } from './EntryForm';
import { AvailabilityFields } from './AvailabilityFields';
import type { Choice, Lesson } from './contracts';
import { ManuscriptEditor } from './ManuscriptEditor';

export function LessonForm({
    base,
    lesson,
    position,
    lessonKinds,
    quizzes,
    startOverview = false,
}: {
    base: string;
    lesson?: Lesson;
    position: number;
    lessonKinds: string[];
    quizzes: Choice[];
    startOverview?: boolean;
}) {
    return (
        <details open={startOverview || undefined}>
            <summary>{lesson ? 'Edit lesson or publish' : 'Author a lesson'}</summary>
            <EntryForm
                action={`${base}/lessons${lesson ? `/${lesson.id}` : ''}`}
                label="Save lesson"
            >
                <label>
                    Title
                    <input name="title" required maxLength={191} defaultValue={lesson?.title} />
                </label>
                <label>
                    Order
                    <input
                        type="number"
                        min="1"
                        name="position"
                        required
                        defaultValue={position}
                    />
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
