import { useState } from 'react';
import { ScriptRubric } from './ScriptRubric';
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
    guide: { rubric, maximum, scriptPreview },
}: {
    assignmentTitle?: string;
    guide: MarkingGuide;
    row: Submission;
    close: () => void;
    save: (row: Submission) => void;
}) {
    const [values, setValues] = useState<string[] | undefined>(() => row.marks?.map(String));
    const [editingMarks, setEditingMarks] = useState(false);
    const [view, setView] = useState(false);
    const [feedback, setFeedback] = useState(row.feedback ?? '');
    const possible = maximum.reduce((sum, value) => sum + value, 0);
    const complete = possible > 0 && values?.length === maximum.length && values.every((value, index) =>
        value !== '' && Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) <= maximum[index]);
    const maySave = !editingMarks || complete;
    const mayReturn = maySave && (row.score !== null || complete);

    function startRubric() {
        setEditingMarks(true);
        setValues(rubric.map(() => ''));
    }

    function changeMark(index: number, value: string) {
        setEditingMarks(true);
        setValues(current => current?.map((mark, i) => i === index ? value : mark));
    }

    function finish(status: 'feedback draft' | 'feedback returned') {
        if (!maySave || (status === 'feedback returned' && !mayReturn)) return;
        const marks = values?.map(Number);
        const calculate = complete && marks && (editingMarks || row.score === null);
        const score = calculate ? Math.round(100 * marks.reduce((sum, mark) => sum + mark, 0) / possible) : row.score;
        save({ ...row, marks, feedback, score, status });
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
            <ScriptRubric rubric={rubric} maximum={maximum} values={values} score={row.score}
                start={startRubric} change={changeMark} />
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
                <Action disabled={!maySave} onClick={() => finish('feedback draft')}>Save draft</Action>
                <Action variant="primary" disabled={!mayReturn} onClick={() => finish('feedback returned')}>
                    Return to student
                </Action>
            </div>
        </Drawer>
    );
}
