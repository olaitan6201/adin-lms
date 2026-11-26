import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { Drawer, Note, RecordName, Sections, Status, exportSheet, inputClass } from './Controls';
import { Editor } from './Editor';
import type { GradeRow, ScoreChange, GradePolicy, Metric } from '@/types/assessments/gradebook';
import { Moderation, stages, Weights } from './GradePanels';

export default function GradebookDesk({ lecturer = false, gradeRows, scoreHistory, policy, metrics, course }: { lecturer?: boolean; gradeRows: GradeRow[]; scoreHistory: ScoreChange[]; policy: GradePolicy; metrics: readonly Metric[]; course: string }) {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState(gradeRows);
    const [history, setHistory] = useState(scoreHistory);
    const [weights, setWeights] = useState(policy.gradeWeights.map(w => w.weight));
    const [state, filter] = useState('');
    const [tool, setTool] = useState('');
    const [search, find] = useState('');
    const [dialog, setDialog] = useState('');
    const approved = rows.filter(r => r.state === 'approved');
    const visible = rows.filter(r => (!state || r.state === state) && `${r.student} ${r.matric}`.toLowerCase().includes(search.toLowerCase()));
    const record = (change: string, reason: string) => setHistory(prev => [{ when: new Date().toLocaleString(), who: lecturer ? 'Lecturer' : 'Examination officer', change, reason }, ...prev]);
    const download = () => exportSheet(`${course}-results`, ['Student', 'Matric', ...metrics.map(m => m[1]), 'Total', 'Grade', 'State'], visible.map(r => [r.student, r.matric, ...metrics.map(([k]) => r[k]), r.total, r.grade, r.state]));
    const release = <Action icon="check" variant="primary" onClick={() => setDialog('publish')}>Publish results</Action>;
    return <div className="assessment-view space-y-5"><PageHeader eyebrow="Results" title="Gradebook" description={lecturer ? 'Enter scores, moderate them and submit them for approval before any result is released.' : 'Weights, scores, moderation and approval, with publication kept under an authorised officer.'} actions={<><Action icon="sheet" onClick={download}>Result sheet</Action>{release}</>}/>
        <Sections labels={['Score sheet', 'Weights and rubric', 'Moderation and approval', 'History']} active={tab} change={setTab}/>
        {tab === 0 && <Card title="Score sheet" subtitle={`${course} · assignments and quizzes, participation, mid-term, practical and final`} actions={<><Action size="sm" icon="users" onClick={() => setDialog('marker')}>Second marker</Action><Action size="sm" icon="sheet" onClick={download}>Download sheet</Action>{release}</>}>
            <div className="mb-4 flex flex-wrap items-center gap-2"><Action size="sm" icon="filter" onClick={() => setTool(tool === 'state' ? '' : 'state')}>{state ? stages.find(s => s[0] === state)?.[1] : 'All states'}</Action><Action size="sm" icon="search" onClick={() => setTool(tool === 'search' ? '' : 'search')}>Find student</Action>{tool === 'state' && <select className="select" aria-label="Filter by state" value={state} onChange={e => filter(e.target.value)}><option value="">All states</option>{stages.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>}
                {tool === 'search' && <input autoFocus className="input" aria-label="Find student" placeholder="Find student" value={search} onChange={e => find(e.target.value)}/>}<small className="ml-auto text-xs text-ink-400">Changes are saved automatically and recorded in the score history</small></div>
            <Table columns={['Student', ...metrics.map(m => m[1]), 'Total', 'Grade', 'State']} rowKeys={visible.map(r => r.matric)} rows={visible.map(r => [
                <RecordName name={r.student} meta={r.matric}/>, ...metrics.map(([key, label, max]) => <input aria-label={`${label} for ${r.student}`} className="input tnum h-9 w-16 px-2 py-1 text-right" type="number" min={0} max={max} disabled={r.state === 'published'} key={`${r.matric}-${r[key]}`} defaultValue={r[key]} onBlur={e => {
                    const n = Number(e.target.value);
                    if (!e.target.value || !e.target.validity.valid) { e.target.value = String(r[key]); return; }
                    if (n === r[key]) return;
                    const total = r.total - r[key] + n;
                    setRows(rows.map(row => row.matric === r.matric ? { ...row, [key]: n, total, grade: policy.boundaries.find(b => total >= b[1])?.[0] ?? 'F', state: 'moderation' } : row));
                    record(`${r.matric}: ${key} ${r[key]} to ${n}`, 'Score sheet adjustment; moderation required');
                }}/>), <strong>{r.total}</strong>, <Badge>{r.grade}</Badge>, <Status value={r.state}/>,
            ])}/>
        </Card>}
        {tab === 1 && <Weights policy={policy} saved={weights} save={setWeights}/>}
        {tab === 2 && <Moderation rows={rows} filter={v => { filter(v); find(''); setTab(0); }}/>}
        {tab === 3 && <Card title="Score and result history" subtitle="Every change keeps the previous value, the reason and the author"><Table columns={['When', 'Who', 'Change', 'Reason']} rows={history.map(h => [h.when, h.who, h.change, h.reason])}/></Card>}
        <Note amber>Published results are immutable in place. Any correction is applied as an approved version with its own reason and audit trail.</Note>
        {dialog === 'publish' && <Drawer title="Publish results" close={() => setDialog('')}>
            {lecturer ? <Note>Publication is reserved for the authorised examination officer.</Note> : <><p>{approved.length} approved result(s) ready to publish. Other results remain unchanged.</p><Action variant="primary" disabled={!approved.length} onClick={() => {
                setRows(rows.map(r => r.state === 'approved' ? { ...r, state: 'published' } : r));
                record(`${approved.length} result(s) published`, 'Approved result release');
                setDialog('');
            }}>Confirm publication</Action></>}
        </Drawer>}
        {dialog === 'marker' && <Drawer title="Second marker" close={() => setDialog('')}><Editor fields={[{ label: 'Student', options: rows.filter(r => r.state !== 'published').map(r => r.student) }, { label: 'Decision', options: lecturer ? ['Send for moderation'] : ['Approve', 'Send for moderation'] }, { label: 'Reason', type: 'textarea', required: true }]} save={v => {
            setRows(rows.map(r => r.student === v.Student ? { ...r, state: v.Decision === 'Approve' ? 'approved' : 'moderation' } : r));
            record(`${v.Student}: ${v.Decision}`, v.Reason);
            setDialog('');
        }}/></Drawer>}
    </div>;
}
