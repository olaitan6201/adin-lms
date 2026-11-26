import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import { examBlueprint, exams, invigilationLog, questionBanks, questions } from '@/data/assessments/cbt';
import { Drawer, Note, Status, exportSheet, type Values } from './Controls';
import { Checks, Editor } from './Editor';

export type Bank = typeof questionBanks[number];
export type Question = typeof questions[number];
export type Exam = typeof exams[number] & { config?: Values };
const types = ['MCQ', 'True/False', 'Matching', 'Gap-fill', 'Short answer', 'Essay', 'Programming'];
export const guards = ['Identity check against the registered candidate', 'Invigilator present for the full access window', 'Random draw of questions per attempt, options shuffled', 'Browser restrictions where the device supports them', 'Additional time for approved accommodations'];

export function BankPanel({ bank, items, add, close }: { bank: Bank; items: Question[]; add: (q: Question) => void; close: () => void }) {
    const [adding, setAdding] = useState(false);
    return <Drawer title={bank.name} subtitle={`${bank.questions} questions · ${bank.security}`} close={close}>
        <Card title="Questions in this bank" actions={<Action size="sm" onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : 'Add question'}</Action>}>
            <Table columns={['#', 'Type', 'Stem', 'Marks', 'Level']} rows={items.map((q, i) => [i + 1, <Status value={q.type}/>, q.stem, q.marks, <Status value={q.difficulty}/>])}/>
        </Card>
        {adding && <Editor fields={[{ label: 'Stem', type: 'textarea', required: true }, { label: 'Type', options: types }, { label: 'Marks', type: 'number', min: 1, initial: '2', required: true }, { label: 'Level', options: ['Easy', 'Medium', 'Hard'] }]} label="Save question" save={v => {
            add({ id: crypto.randomUUID(), no: items.length + 1, stem: v.Stem, type: v.Type, marks: Number(v.Marks), difficulty: v.Level, answered: 0 });
            setAdding(false);
        }}/>}
        <Note>Question text is restricted to authorised roles.</Note>
    </Drawer>;
}

const papers = [
    ['AOU/2023/0412', 'Paper A-114', '18 Nov 2026, 08:52', 'Submitted'],
    ['AOU/2024/1187', 'Paper B-207', '18 Nov 2026, 08:47', 'Submitted'],
    ['AOU/2023/0288', 'Paper A-115', '18 Nov 2026, 09:01', 'Submitted'],
    ['AOU/2023/0901', 'Paper C-093', 'Not started', 'Not started'],
];

export function Blueprint({ exam, close, save }: { exam?: Exam; close: () => void; save: (v: Values) => void }) {
    return <Drawer title={exam ? `${exam.title} blueprint` : 'Schedule examination'} close={close}>
        <Card title="Blueprint" subtitle="Total 100 marks"><Table columns={['Section', 'Items', 'Marks', 'Type']} rows={examBlueprint.map(s => [s.section, s.items, s.marks, s.type])}/></Card>
        <Card title="Sitting configuration"><Editor fields={[
            { label: 'Examination', initial: exam?.title, required: true }, { label: 'Course', initial: exam?.course ?? 'ACC302', required: true },
            { label: 'Duration (minutes)', type: 'number', min: 1, initial: exam?.duration.split(' ')[0] ?? '90', required: true },
            { label: 'Access window opens', type: 'datetime-local', initial: '2026-11-18T08:45', required: true },
            { label: 'Access window closes', type: 'datetime-local', initial: '2026-11-18T10:45', required: true },
            { label: 'Attempt limit', options: ['1 attempt', '2 attempts'] }, { label: 'Auto-submit on expiry', options: ['Always', 'Prompt only'] },
            { label: 'Random draw', options: ['Per candidate', 'Fixed paper'] }, { label: 'Shuffle options', options: ['Yes', 'No'] },
        ]} initial={exam?.config} save={save}/></Card>
        <Card title="Attempt papers" subtitle="The paper drawn for each attempt, kept as issued"><Table columns={['Candidate', 'Paper', 'Started', 'State']} rows={exam?.id === 'ex-1' ? papers : []}/>
            <Note>Re-issue rule: a second attempt draws a new paper from the same blueprint. The first paper is retained.</Note></Card>
        <Card title="Accommodations"><p>{exam?.id === 'ex-1' ? '3' : '0'} candidates approved · Additional time or separate invigilation.</p></Card>
    </Drawer>;
}

export function SecurityPanel({ selected, change }: { selected: string[]; change: (v: string[]) => void }) {
    return <div className="grid gap-5 lg:grid-cols-2"><Card title="Invigilation log" subtitle="Identity checks, browser guard events and submissions during a sitting" actions={<Action size="sm" onClick={() => exportSheet('invigilation-log', ['Time', 'Event', 'Actor', 'Level'], invigilationLog.map(r => [r.time, r.event, r.actor, r.level]))}>Full log</Action>}>
        <ol className="divide-y divide-slate-100">{invigilationLog.map(r => <li key={r.time} className="flex gap-3 py-3"><span className={`mt-2 size-2 shrink-0 rounded-full ${r.level === 'warn' ? 'bg-amber-500' : 'bg-emerald-500'}`}/><div>{r.event}<small className="block text-slate-500">{r.time} · {r.actor}</small></div></li>)}</ol>
    </Card><Card title="Controls applied to a sitting" subtitle="Identity, invigilation, question design and browser restrictions">
        <Checks labels={guards} selected={selected} change={change}/><p className="mt-3 text-xs text-slate-600">Suspicious events are logged for officer review. Device capabilities limit browser restrictions.</p>
    </Card></div>;
}
