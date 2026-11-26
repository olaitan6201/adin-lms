import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import type { Assignment, AssignmentDraft, MarkingGuide, Submission } from '@/types/assessments/assignments';
import { Drawer } from './Controls';
import { Fields, inputClass, type FieldSpec, type Values, submitClass } from './Editor';
import { Note } from '@/components/ui/feedback/Note';

export const feedbackChecks = [
    'Issue a submission receipt on upload',
    'Return the marked script with annotations',
    'Allow a written comment thread on each submission',
    'Allow the student to see the rubric before submitting',
];

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
        <Drawer title={row?.title ?? 'New assignment'} subtitle={row && `${row.course} · closes ${row.due}`} close={close}>
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
                    Changing a closing date after submissions exist notifies affected students and is written to the audit log.
                </Note>
                <div className="flex justify-end gap-2">
                    <Action onClick={close}>Close</Action>
                    <button className={submitClass}>Save</button>
                </div>
            </form>
        </Drawer>
    );
}

export function MarkingPanel({
    row,
    assignmentTitle,
    close,
    save,
    guide: { rubric, maximum, awarded, scriptPreview },
}: {
    assignmentTitle?: string;
    guide: MarkingGuide;
    row: Submission;
    close: () => void;
    save: (row: Submission) => void;
}) {
    const [marks, setMarks] = useState(row.marks ?? awarded);
    const [view, setView] = useState(false);
    const [feedback, setFeedback] = useState(row.feedback ?? '');
    const possible = maximum.reduce((sum, value) => sum + value, 0);
    const earned = marks.reduce((sum, value) => sum + value, 0);
    function finish(status: 'feedback draft' | 'feedback returned') {
        save({ ...row, marks, feedback, score: possible ? Math.round((100 * earned) / possible) : null, status });
    }
    return (
        <Drawer title={row.student} subtitle={`${row.matric} · submitted ${row.submitted}`} close={close}>
            <div className="flex flex-wrap gap-2">
                <Badge tone={row.late ? 'amber' : 'emerald'}>{row.late ? 'Late' : 'On time'}</Badge>
                <Badge>Attempt 1 of 1</Badge>
                <Badge>Receipt issued</Badge>
            </div>
            <Card title="Submitted work">
                <strong>{row.file ?? assignmentTitle}</strong>
                <p className="text-sm text-slate-500">
                    {row.size ?? 'PDF'} · uploaded {row.submitted}
                </p>
                <Action size="sm" onClick={() => setView(!view)}>
                    {view ? 'Hide' : 'View'}
                </Action>
                {view && <p className="mt-3 rounded-lg bg-slate-50 p-4">{scriptPreview}</p>}
            </Card>
            <Card title="Rubric" subtitle="Weighted criteria applied to this submission">
                {rubric.map((r, i) => (
                    <label key={r} className="flex items-center justify-between gap-4 border-b py-2 text-sm">
                        {r}
                        <span className="flex items-center gap-2">
                            <output>
                                {marks[i]} / {maximum[i]}
                            </output>
                            <input
                                className="w-24 accent-brand-600"
                                type="range"
                                min={0}
                                max={maximum[i]}
                                value={marks[i]}
                                onChange={(e) => setMarks(marks.map((v, n) => (n === i ? Number(e.target.value) : v)))}
                            />
                        </span>
                    </label>
                ))}
                <p className="mt-3 flex justify-between border-t pt-3 font-semibold">
                    <span>Total</span>
                    <span>
                        {earned} / {possible}
                    </span>
                </p>
            </Card>
            <Card title="Written feedback">
                <textarea
                    className={inputClass}
                    rows={4}
                    aria-label="Written feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />
            </Card>
            <div className="flex justify-end gap-2">
                <Action onClick={() => finish('feedback draft')}>Save draft</Action>
                <Action variant="primary" onClick={() => finish('feedback returned')}>
                    Return to student
                </Action>
            </div>
        </Drawer>
    );
}
