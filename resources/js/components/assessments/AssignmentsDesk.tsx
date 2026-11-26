import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import type { Assignment, Submission, MarkingGuide } from '@/types/assessments/assignments';
import { AssignmentEditor, MarkingPanel, feedbackChecks } from './AssignmentPanels';
import { Checks } from './Editor';
import { Fields, Note, RecordName, Sections, Status, exportSheet, type FieldSpec, type Values } from './Controls';

export default function AssignmentsDesk({ lecturer = false, assignments, submissions, awaiting, guide, opens, enrolment, timing, ruleFields }: { timing: FieldSpec[]; ruleFields: FieldSpec[]; lecturer?: boolean; assignments: Assignment[]; submissions: Submission[]; awaiting: number; guide: MarkingGuide; opens: string; enrolment: number }) {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState<Assignment[]>(assignments);
    const [queue, setQueue] = useState<Submission[]>(submissions);
    const [edit, setEdit] = useState<Assignment | 'new'>();
    const [mark, setMark] = useState<Submission>();
    const [rules, setRules] = useState<Values>({});
    const [checks, setChecks] = useState(feedbackChecks.slice(0, 3));
    const [filter, setFilter] = useState('');
    const report = () => exportSheet('marking-report', ['Assignment', 'Course', 'Submissions', 'Marked'], rows.map(r => [r.title, r.course, r.submissions, r.marked]));
    const create = <Action variant="primary" icon="plus" onClick={() => setEdit('new')}>New assignment</Action>;
    return <div className="assessment-view space-y-5"><PageHeader eyebrow="Assessment" title={lecturer ? 'Assignments and marking' : 'Assignments'} description={lecturer ? 'Set instructions and rules, track what has arrived, and return marked work with written feedback.' : 'Institution-wide view of assignment design, submission volume and marking throughput.'}
        actions={<><Action icon="chart" onClick={report}>Marking report</Action>{create}</>}/>
        <Sections labels={['Assignments', `${lecturer ? 'Marking' : 'Submission'} queue`, 'Rules and feedback']} counts={[rows.length, awaiting]} active={tab} change={v => { setTab(v); setFilter(''); }}/>
        {tab === 0 && <Card className="assignment-list" title="Assignments" subtitle="Instructions, attachments, opening and closing dates, late rules and group work" actions={<><Badge>{rows.length} assignments</Badge><Action size="sm" variant="primary" icon="plus" onClick={() => setEdit('new')}>New assignment</Action></>}>
            <Table columns={['Assignment', 'State', 'Submitted', 'Late', 'Marked', '']} rows={rows.map(r => [
                <RecordName name={r.title} meta={`${r.course} · due ${r.due}`}/>, <Status value={r.state}/>, `${r.submissions} / ${r.total}`, r.late,
                <div className="flex w-28 items-center gap-2"><div className="prog-track"><div className={`prog-fill ${r.marked === r.total ? 'bg-brand-500' : 'bg-amber-500'}`} style={{ width: `${100 * r.marked / (r.total || 1)}%` }}/></div><span className="tnum text-[11px] font-medium text-ink-600">{Math.round(100 * r.marked / (r.total || 1))}%</span></div>,
                <div className="flex justify-end gap-1.5"><Action size="sm" onClick={() => setEdit(r)}>Edit</Action><Action size="sm" onClick={() => { const candidate = queue.find(s => s.assignment === r.title); if (candidate) setMark(candidate); else { setFilter(r.title); setTab(1); } }}>Mark</Action></div>,
            ])}/>
        </Card>}
        {tab === 1 && <Card title="Marking queue" subtitle={filter || 'Submissions awaiting a score, written feedback and a returned script'} actions={<Action size="sm" onClick={() => exportSheet('submission-queue', ['Student', 'Matric', 'Score'], queue.map(r => [r.student, r.matric, r.score]))}>Export sheet</Action>}>
            <Table columns={['Student', 'Submitted', 'Timing', 'Status', 'Score', '']} empty="No submissions for this assignment." rows={queue.filter(r => !filter || r.assignment === filter).map(r => [
                <RecordName name={r.student} meta={r.matric}/>, r.submitted, r.late ? 'Late' : 'On time', <Status value={r.status}/>, r.score ?? '—', <Action size="sm" onClick={() => setMark(r)}>Open</Action>,
            ])}/>
        </Card>}
        {tab === 2 && <div className="grid gap-5 lg:grid-cols-2"><Card title="Submission rules" subtitle="Applied per assignment unless the lecturer overrides them"><Fields fields={ruleFields} values={rules} change={setRules}/></Card>
            <Card title="Feedback and return" subtitle="How marked work reaches the student"><Checks labels={feedbackChecks} selected={checks} change={setChecks}/></Card></div>}
        <Note>A submission receipt is issued on upload and every score change is retained with the reason and the author.</Note>
        {edit && <AssignmentEditor timing={timing} opens={opens} course={assignments[0]?.course} key={edit === 'new' ? edit : edit.id} row={edit === 'new' ? undefined : edit} rules={rules} close={() => setEdit(undefined)} save={v => {
            if (!edit) return;
            const base = edit === 'new' ? { id: crypto.randomUUID(), marked: 0, total: enrolment, submissions: 0, late: 0, state: 'scheduled' } : edit;
            const updated = { ...base, title: v.Title, course: v.Course, due: v.Closes.replace('T', ' '), settings: v };
            setRows(edit === 'new' ? [...rows, updated] : rows.map(r => r.id === edit.id ? updated : r));
            setQueue(queue.map(r => edit !== 'new' && r.assignment === edit.title ? { ...r, assignment: v.Title } : r));
            setEdit(undefined);
        }}/>}
        {mark && <MarkingPanel guide={guide} key={mark.id} row={mark} close={() => setMark(undefined)} save={v => {
            if (!mark) return;
            setQueue(queue.map(r => r.id === v.id ? v : r));
            if ((mark.score === null || mark.status === 'feedback draft') && v.status === 'feedback returned') setRows(rows.map(r => r.title === v.assignment ? { ...r, marked: Math.min(r.submissions, r.marked + 1) } : r));
            setMark(undefined);
        }}/>}
    </div>;
}
