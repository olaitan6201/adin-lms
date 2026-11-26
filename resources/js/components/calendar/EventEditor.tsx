import type { FormEvent } from 'react';
import { Field } from '@/components/ui/controls/Field';
import type { CalendarEvent, ScheduleData } from '@/types/calendar/calendar';

export type EventDraft = Omit<CalendarEvent, 'id' | 'owner'>;

type EditorProps = Pick<ScheduleData, 'defaultTime' | 'defaultCourse' | 'kinds'> & {
    defaultDate: string;
    onSave: (draft: EventDraft) => void;
};

export function EventEditor({ defaultDate, defaultTime, defaultCourse, kinds, onSave }: EditorProps) {
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const value = (key: keyof EventDraft) => String(fields.get(key)).trim();

        onSave({
            date: value('date'),
            time: value('time'),
            title: value('title'),
            course: value('course'),
            kind: value('kind'),
        });
    }

    return (
        <form className="space-y-4" onSubmit={submit}>
            <Field label="Title">
                <input
                    name="title"
                    className="input"
                    required
                    pattern=".*\S.*"
                />
            </Field>
            <Field label="Date">
                <input
                    name="date"
                    type="date"
                    className="input"
                    required
                    defaultValue={defaultDate}
                />
            </Field>
            <Field label="Time">
                <input
                    name="time"
                    type="time"
                    className="input"
                    required
                    defaultValue={defaultTime}
                />
            </Field>
            <Field label="Course">
                <input
                    name="course"
                    className="input"
                    defaultValue={defaultCourse}
                    required
                />
            </Field>
            <Field label="Event type">
                <select className="select" name="kind">
                    {kinds.map(({ kind }) => (
                        <option key={kind}>{kind}</option>
                    ))}
                </select>
            </Field>
            <button className="btn btn-primary">Save event</button>
        </form>
    );
}
