import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import type { Assignment, AssignmentDraft } from '@/types/assessments/assignments';
import { Drawer } from '../Drawer';
import { Fields, type FieldSpec, type Values, submitClass } from '../Editor';
import { Note } from '@/components/ui/feedback/Note';

export function AssignmentEditor({
    row,
    rules,
    close,
    save,
    opens,
    course,
    timing,
}: {
    timing: FieldSpec[];
    opens: string;
    course?: string;
    row?: Assignment;
    rules: Values;
    close: () => void;
    save: (draft: AssignmentDraft) => void;
}) {
    const [values, setValues] = useState<Values>({
        ...Object.fromEntries(timing.map((f) => [f.label, f.options?.[0] ?? ''])),
        ...rules,
        Title: row?.title ?? '',
        Course: row?.course ?? course ?? '',
        Instructions: row?.instructions ?? '',
        Attachments: row?.attachments ?? '',
        Opens: opens,
        Closes: row ? `${opens.slice(0, 7)}-${row.due.slice(0, 2)}T${row.due.slice(-5)}` : '',
        ...row?.settings,
    });
    function submit(event: React.FormEvent) {
        event.preventDefault();
        save({
            title: values.Title,
            course: values.Course,
            due: values.Closes.replace('T', ' '),
            instructions: values.Instructions,
            attachments: values.Attachments,
            settings: values,
        });
    }

    return (
        <Drawer
            title={row?.title ?? 'New assignment'}
            subtitle={row && `${row.course} · closes ${row.due}`}
            close={close}
        >
            <form className="space-y-4" onSubmit={submit}>
                <Card title="Instructions">
                    <Fields
                        fields={[
                            { label: 'Title', required: true },
                            ...(!row ? [{ label: 'Course', required: true }] : []),
                            { label: 'Instructions', type: 'textarea', required: true },
                            { label: 'Attachments' },
                        ]}
                        values={values}
                        change={setValues}
                    />
                </Card>
                <Card title="Timing and rules">
                    <Fields
                        fields={timing.map((f) =>
                            f.options && values[f.label] && !f.options.includes(values[f.label])
                                ? { ...f, options: [...f.options, values[f.label]] }
                                : f,
                        )}
                        values={values}
                        change={setValues}
                    />
                </Card>
                <Note amber>
                    Changing a closing date after submissions exist notifies affected students and is written
                    to the audit log.
                </Note>
                <div className="flex justify-end gap-2">
                    <Action onClick={close}>Close</Action>
                    <button className={submitClass}>Save</button>
                </div>
            </form>
        </Drawer>
    );
}
