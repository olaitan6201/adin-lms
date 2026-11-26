import { useState } from 'react';
import { Action, Card } from '@/components/workspace/Elements';
import { assignments, submissions } from './assignmentData';
import { Drawer, Fields, inputClass, type FieldSpec, type Values } from './Controls';
import { submitClass } from './Editor';

export type Assignment = typeof assignments[number] & { settings?: Values };
export type Submission = typeof submissions[number] & { feedback?: string; marks?: number[] };
export const ruleFields: FieldSpec[] = [
    { label: 'Accepted formats', options: ['PDF, DOCX, XLSX, images', 'PDF only'] },
    { label: 'Maximum file size', options: ['25 MB', '10 MB', '50 MB'] },
    { label: 'Late submission policy', options: ['Accepted, marked with a 10% penalty', 'Not accepted after closing'] },
    { label: 'Revision after submission', options: ['Allowed until the closing date', 'Not allowed'] },
    { label: 'Individual or group', options: ['Individual', 'Group'] },
];
export const feedbackChecks = ['Issue a submission receipt on upload', 'Return the marked script with annotations', 'Allow a written comment thread on each submission', 'Allow the student to see the rubric before submitting'];
export const instructions = 'Answer questions 1 to 8. For each transaction, state the journal entry, post it to the ledger and extract a trial balance.';

export function AssignmentEditor({ row, rules, close, save }: { row?: Assignment; rules: Values; close: () => void; save: (v: Values) => void }) {
    const [values, setValues] = useState<Values>({
        ...Object.fromEntries(ruleFields.map(f => [f.label, f.options?.[0] ?? ''])), ...rules,
        Title: row?.title ?? '', Course: row?.course ?? 'ACC302', Instructions: row?.id === 'as-1' ? instructions : '',
        Attachments: row?.id === 'as-1' ? 'problem-set.pdf, template-trial-balance.xlsx' : '',
        Opens: '2026-11-07', Closes: row ? `2026-11-${row.due.slice(0, 2)}T${row.due.slice(-5)}` : '', ...row?.settings,
    });
    return <Drawer title={row?.title ?? 'New assignment'} subtitle={row?.course} close={close}><form className="space-y-4" onSubmit={e => { e.preventDefault(); save(values); }}>
        <Card title="Instructions"><Fields fields={[{ label: 'Title', required: true }, { label: 'Course', required: true }, { label: 'Instructions', type: 'textarea', required: true }, { label: 'Attachments' }]} values={values} change={setValues}/></Card>
        <Card title="Timing and rules"><Fields fields={[{ label: 'Opens', type: 'date', required: true }, { label: 'Closes', type: 'datetime-local', required: true }, ...ruleFields]} values={values} change={setValues}/></Card>
        <button className={submitClass}>Save</button>
    </form></Drawer>;
}

export const rubric = ['Correct journal entry', 'Correct ledger posting', 'Trial balance extracted and balanced'];
const maximum = [10, 6, 4];
export function MarkingPanel({ row, close, save }: { row: Submission; close: () => void; save: (row: Submission) => void }) {
    const [marks, setMarks] = useState(row.marks ?? [8, 5, 3]);
    const [view, setView] = useState(false);
    const [feedback, setFeedback] = useState(row.feedback ?? '');
    const finish = (status: string) => save({ ...row, marks, feedback, score: marks.reduce((a, b) => a + b, 0) * 5, status });
    return <Drawer title={row.student} subtitle={`${row.matric} · submitted ${row.submitted}`} close={close}>
        <Card title="Submitted work" actions={<Action size="sm" onClick={() => setView(!view)}>{view ? 'Hide' : 'View'}</Action>}>
            <strong>{row.assignment}</strong><p className="text-sm text-slate-500">PDF · uploaded {row.submitted}</p>
            {view && <p className="mt-3 rounded-lg bg-slate-50 p-4">Sample script · Journal entries, ledger postings and trial balance.</p>}
        </Card>
        <Card title="Rubric" subtitle="Weighted criteria applied to this submission">
            {rubric.map((r, i) => <label key={r} className="flex items-center justify-between gap-4 border-b py-2 text-sm">{r}
                <span className="flex items-center gap-2"><input className={`${inputClass} max-w-16`} type="number" min={0} max={maximum[i]} value={marks[i]}
                    onChange={e => setMarks(marks.map((v, n) => n === i ? Math.min(maximum[i], Math.max(0, Number(e.target.value))) : v))}/> / {maximum[i]}</span></label>)}
        </Card>
        <Card title="Written feedback"><textarea className={inputClass} rows={4} aria-label="Written feedback" value={feedback} onChange={e => setFeedback(e.target.value)}/></Card>
        <div className="flex justify-end gap-2"><Action onClick={() => finish('feedback draft')}>Save draft</Action>
            <Action variant="primary" onClick={() => finish('feedback returned')}>Return to student</Action></div>
    </Drawer>;
}
