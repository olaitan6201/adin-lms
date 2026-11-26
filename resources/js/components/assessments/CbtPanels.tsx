import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Bank, Question, Exam, BlueprintData, LogEntry } from '@/types/assessments/cbt';
import { Drawer, Note, Status, exportSheet, type Values } from './Controls';
import { Checks, Editor } from './Editor';

const types = ['MCQ', 'True/False', 'Matching', 'Gap-fill', 'Short answer', 'Essay', 'Programming'];
export const guards = ['Identity check against the registered candidate', 'Invigilator present for the full access window', 'Random draw of questions per attempt, options shuffled', 'Browser restrictions where the device supports them', 'Additional time for approved accommodations'];

export function BankPanel({ bank, items, add, close }: { bank: Bank; items: Question[]; add: (q: Question) => void; close: () => void }) {
    const [adding, setAdding] = useState(false);
    return <Drawer title={bank.name} subtitle={`${bank.questions} questions · ${bank.security === 'restricted' ? 'restricted to examination officers' : 'open to lecturer'}`} close={close}>
        <Card title="Questions in this bank">
            <Table columns={['#', 'Type', 'Stem', 'Marks', 'Level']} rows={items.map((q, i) => [i + 1, <Status value={q.type}/>, q.stem, q.marks, <Status value={q.difficulty}/>])}/>
        </Card>
        {adding && <Editor fields={[{ label: 'Stem', type: 'textarea', required: true }, { label: 'Type', options: types }, { label: 'Marks', type: 'number', min: 1, initial: '2', required: true }, { label: 'Level', options: ['Easy', 'Medium', 'Hard'] }]} label="Save question" save={v => {
            add({ id: crypto.randomUUID(), no: items.length + 1, stem: v.Stem, type: v.Type, marks: Number(v.Marks), difficulty: v.Level, answered: 0 });
            setAdding(false);
        }}/>}
        <Note amber>Question text is only visible to authorised roles. Opening a bank is written to the audit log with the officer and the time.</Note>
        <div className="flex justify-end gap-2"><Action onClick={close}>Close</Action><Action variant="primary" onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : 'Add question'}</Action></div>
    </Drawer>;
}


export function Blueprint({ exam, close, save, data }: { data: BlueprintData; exam?: Exam; close: () => void; save: (v: Values) => void }) {
    return <Drawer title={exam ? `${exam.title.replace(/ examination$/, '')} blueprint` : 'Schedule examination'} subtitle={exam && `${exam.date} · ${exam.duration.replace(' min', ' minutes')} · ${exam.candidates} candidates`} close={close}>
        <Card title="Blueprint" subtitle={`Total ${data.examBlueprint.reduce((sum, s) => sum + s.marks, 0)} marks`}><Table columns={['Section', 'Items', 'Marks', 'Types']} rows={data.examBlueprint.map(s => [s.section, s.items, s.marks, s.type])}/></Card>
        <Card title="Sitting configuration"><Editor formId="sitting-configuration" externalSubmit fields={[
            ...(!exam ? [{ label: 'Examination', required: true }, { label: 'Course', initial: data.defaultCourse, required: true },
            { label: 'Duration (minutes)', type: 'number', min: 1, initial: data.duration, required: true }] : []),
            { label: 'Access window opens', type: 'datetime-local', initial: data.opens, required: true },
            { label: 'Access window closes', type: 'datetime-local', initial: data.closes, required: true },
            { label: 'Attempt limit', options: ['1 attempt', '2 attempts'] }, { label: 'Auto-submit on expiry', options: ['Always', 'Prompt only'] },
            { label: 'Random draw', options: ['Per candidate', 'Fixed paper'] }, { label: 'Shuffle options', options: ['Yes', 'No'] },
        ]} initial={exam ? { Examination: exam.title, Course: exam.course, 'Duration (minutes)': exam.duration.split(' ')[0], ...exam.config } : undefined} save={save}/></Card>
        <Card title="Attempt papers" subtitle="The paper drawn for each attempt, kept as issued so a candidate can be shown exactly what they sat">
            <p className="flex justify-between gap-2 text-sm font-medium">Attempt 1 · drawn per candidate <Badge tone="sky">Seeded draw</Badge></p>
            <p className="my-2 text-xs leading-relaxed text-ink-500">Each candidate receives a different question order and option order from the same blueprint. The drawn paper is preserved with the attempt and cannot be regenerated afterwards.</p>
            <Table columns={['Candidate', 'Paper', 'Started', 'State']} rows={data.papersByExam[exam?.id ?? ''] ?? []}/>
            <div className="mt-3 rounded-xl border border-ink-100 p-3.5"><strong>Re-issue rule</strong> <Badge tone="amber">Second attempt</Badge><p className="mt-1 text-xs">A candidate who is re-scheduled sits a new attempt drawn from the same blueprint. The first paper is retained and shown to the reviewer alongside the second.</p></div></Card>
        <Card title="Accommodations"><div className="flex items-center justify-between rounded-lg bg-ink-50 p-3"><div><p>{data.accommodations[exam?.id ?? ''] ?? 0} candidates approved</p><p className="text-xs text-ink-500">Additional time or separate invigilation, recorded against the candidate</p></div><Badge tone="sky">{data.accommodations[exam?.id ?? ''] ?? 0}</Badge></div></Card>
        <div className="flex justify-end gap-2"><Action onClick={close}>Close</Action><button className="btn btn-primary" form="sitting-configuration">Save</button></div>
    </Drawer>;
}

export function SecurityPanel({ selected, change, invigilationLog }: { invigilationLog: LogEntry[]; selected: string[]; change: (v: string[]) => void }) {
    return <div className="grid gap-5 lg:grid-cols-2"><Card title="Invigilation log" subtitle="Identity checks, browser guard events and submissions during a sitting" actions={<Action size="sm" onClick={() => exportSheet('invigilation-log', ['Time', 'Event', 'Actor', 'Level'], invigilationLog.map(r => [r.time, r.event, r.actor, r.level]))}>Full log</Action>}>
        <ol className="divide-y divide-slate-100">{invigilationLog.map(r => <li key={r.time} className="flex gap-3 py-3"><span className={`mt-2 size-2 shrink-0 rounded-full ${r.level === 'warn' ? 'bg-amber-500' : 'bg-emerald-500'}`}/><div>{r.event}<small className="block text-slate-500">{r.time} · {r.actor}</small></div></li>)}</ol>
    </Card><Card title="Controls applied to a sitting" subtitle="Identity, invigilation, question design and browser restrictions">
        <Checks labels={guards} selected={selected} change={change}/><p className="mt-3 text-xs text-slate-600">Suspicious events are logged for officer review. Device capabilities limit browser restrictions.</p>
    </Card></div>;
}
