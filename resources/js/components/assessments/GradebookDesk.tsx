import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import { Drawer, RecordName, Sections, Status } from './Controls';
import { Note } from '@/components/ui/feedback/Note';
import { exportSheet } from '@/lib/csv';
import { ScoreField } from './gradebook/ScoreField';
import { SecondMarkerForm } from './gradebook/SecondMarkerForm';
import { gradeForTotal, useGradebook, type MarkerDecision } from './gradebook/useGradebook';
import type { GradeRow, ScoreChange, GradePolicy, Metric } from '@/types/assessments/gradebook';
import { Moderation, stages, Weights } from './GradePanels';

type Props = {
    lecturer?: boolean;
    gradeRows: GradeRow[];
    scoreHistory: ScoreChange[];
    policy: GradePolicy;
    metrics: readonly Metric[];
    course: string;
};

export default function GradebookDesk({ lecturer = false, gradeRows, scoreHistory, policy, metrics, course }: Props) {
    const [tab, setTab] = useState(0);
    const { rows, history, adjustScore, secondMark, publishApproved } = useGradebook({ rows: gradeRows, history: scoreHistory }, policy, lecturer);
    const [weights, setWeights] = useState(policy.gradeWeights.map(w => w.weight));
    const [state, filter] = useState('');
    const [tool, setTool] = useState('');
    const [search, find] = useState('');
    const [dialog, setDialog] = useState('');
    const approved = rows.filter(r => r.state === 'approved');
    const releaseDifferences = approved.map(row => ({ row, preview: gradeForTotal(row.total, policy.boundaries) }))
        .filter(({ row, preview }) => row.grade !== preview);
    const visible = rows.filter(r => (!state || r.state === state) && `${r.student} ${r.matric}`.toLowerCase().includes(search.toLowerCase()));
    function confirmPublication() {
        publishApproved();
        setDialog('');
    }

    function saveDecision(matric: string, decision: MarkerDecision, reason: string) {
        secondMark(matric, decision, reason);
        setDialog('');
    }

    function showStage(value: string) {
        filter(value);
        find('');
        setTab(0);
    }

    function download() {
        exportSheet(`${course}-results`,
            ['Student', 'Matric', ...metrics.map(([, label]) => label), 'Total', 'Recorded grade', 'State'],
            visible.map(r => [r.student, r.matric, ...metrics.map(([key]) => r[key]), r.total, r.grade, r.state]),
        );
    }

    const release = () => setDialog('publish');
    const description = lecturer
        ? 'Enter scores, moderate them and submit them for approval before any result is released.'
        : 'Weights, scores, moderation and approval, with publication kept under an authorised officer.';
    return (
        <div className="assessment-view space-y-5">
            <PageHeader eyebrow="Results" title="Gradebook" description={description} actions={<>
                <Action icon="sheet" onClick={download}>Result sheet</Action>
                <Action icon="check" variant="primary" onClick={release}>Publish results</Action>
            </>} />
            <Sections labels={['Score sheet', 'Weights and rubric', 'Moderation and approval', 'History']} active={tab} change={setTab} />
            {tab === 0 && (
                <Card className="grade-sheet" title="Score sheet" subtitle={`${course} · assignments and quizzes, participation, mid-term, practical and final`} actions={<>
                    <Action size="sm" icon="users" onClick={() => setDialog('marker')}>Second marker</Action>
                    <Action size="sm" icon="sheet" onClick={download}>Download sheet</Action>
                    <Action size="sm" icon="check" variant="primary" onClick={release}>Publish results</Action>
                </>}>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Action size="sm" icon="filter" onClick={() => setTool(tool === 'state' ? '' : 'state')}>
                            {stages.find(([id]) => id === state)?.[1] ?? 'All states'}
                        </Action>
                        <Action size="sm" icon="search" onClick={() => setTool(tool === 'search' ? '' : 'search')}>Find student</Action>
                        {tool === 'state' && <select className="select" aria-label="Filter by state" value={state} onChange={e => filter(e.target.value)}>
                            <option value="">All states</option>
                            {stages.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>}
                        {tool === 'search' && <input autoFocus className="input" aria-label="Find student" placeholder="Find student" value={search} onChange={e => find(e.target.value)} />}
                        <small className="ml-auto text-xs text-ink-400">Changes are saved automatically and recorded in the score history</small>
                    </div>
                    <p className="mb-3 text-sm">The sheet shows recorded grades. Changing a score recalculates that row’s grade using the boundaries under Weights and rubric.</p>
                    <Table columns={['Student', ...metrics.map(([, label]) => label), 'Total', 'Recorded grade', 'State']} rowKeys={visible.map(r => r.matric)} rows={visible.map(r => [
                        <RecordName name={r.student} meta={r.matric} />,
                        ...metrics.map(metric => <ScoreField key={metric[0]} row={r} metric={metric} adjust={adjustScore} />),
                        <span className="tnum text-[13px] font-semibold text-ink-900">{r.total}</span>,
                        <Badge tone={r.grade === 'A' ? 'emerald' : r.grade === 'F' ? 'rose' : 'slate'}>{r.grade}</Badge>,
                        r.state === 'approved' ? <Badge tone="sky">Approved</Badge> : <Status value={r.state} />,
                    ])} />
                </Card>
            )}
            {tab === 1 && <Weights policy={policy} saved={weights} save={setWeights} />}
            {tab === 2 && <Moderation rows={rows} filter={showStage} />}
            {tab === 3 && <Card title="Score and result history" subtitle="Every change keeps the previous value, the reason and the author">
                <Table columns={['When', 'Who', 'Change', 'Reason']} rows={history.map(h => [h.when, h.who, h.change, h.reason])} />
            </Card>}
            <Note amber>Published results are immutable in place. Any correction is applied as an approved version with its own reason and audit trail.</Note>
            {dialog === 'publish' && <Drawer title="Publish results" close={() => setDialog('')}>
                {lecturer ? <Note>Publication is reserved for the authorised examination officer.</Note> : <>
                    <p>{approved.length} approved result(s) ready to publish. Publication keeps the recorded grade; it does not recalculate it.</p>
                    {releaseDifferences.length > 0 && <ul className="list-disc pl-5">
                        {releaseDifferences.map(({ row, preview }) => <li key={row.matric}>
                            {row.student} ({row.matric}): {row.total} total. Recorded grade: {row.grade}. Boundary preview: {preview}.
                        </li>)}
                    </ul>}
                    <Action variant="primary" disabled={!approved.length} onClick={confirmPublication}>Confirm publication</Action>
                </>}
            </Drawer>}
            {dialog === 'marker' && <Drawer title="Second marker" close={() => setDialog('')}>
                <SecondMarkerForm rows={rows} lecturer={lecturer} save={saveDecision} />
            </Drawer>}
        </div>
    );
}
