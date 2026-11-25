import { EntryForm } from './EntryForm';
import { AvailabilityFields } from './AvailabilityFields';
import type { Lesson } from './contracts';

export function LessonForm({
    base,
    lesson,
    position,
    lessonKinds,
}: {
    base: string;
    lesson?: Lesson;
    position: number;
    lessonKinds: string[];
}) {
    return (
        <details>
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
                    <select name="kind" defaultValue={lesson?.kind}>
                        {lessonKinds.map((k) => (
                            <option key={k}>{k}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Lesson text (outcomes, examples, exercises and references)
                    <textarea rows={8} name="body" defaultValue={lesson?.body || ''} />
                </label>
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
