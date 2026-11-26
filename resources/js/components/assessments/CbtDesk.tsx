import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import type { Bank, Question, Exam, BlueprintData, LogEntry } from '@/types/assessments/cbt';
import { Drawer, Note, RecordName, Sections, Status, exportSheet } from './Controls';
import { Editor } from './Editor';
import { BankPanel, Blueprint, SecurityPanel, guards } from './CbtPanels';

export default function CbtDesk({ exams, questionBanks, total, bankItems, blueprint, invigilationLog }: { exams: Exam[]; questionBanks: Bank[]; total: number; bankItems: Record<string, Question[]>; blueprint: BlueprintData; invigilationLog: LogEntry[] }) {
    const [tab, setTab] = useState(0);
    const [banks, setBanks] = useState(questionBanks);
    const [sittings, setSittings] = useState<Exam[]>(exams);
    const [bankId, setBankId] = useState('');
    const [questionTotal, setQuestionTotal] = useState(total);
    const [items, setItems] = useState<Record<string, Question[]>>(bankItems);
    const [exam, setExam] = useState<Exam | 'new'>();
    const [selected, setSelected] = useState(guards.slice(0, 4));
    const bank = banks.find(b => b.id === bankId);
    const schedule = <Action variant="primary" icon="plus" onClick={() => setExam('new')}>Schedule examination</Action>;
    return <div className="assessment-view space-y-5"><PageHeader eyebrow="Examination" title="CBT examinations" description="Build banks, schedule sittings, run them under controlled access, and hold results until an officer releases them."
        actions={<><Action icon="chart" onClick={() => exportSheet('examination-report', ['Examination', 'Date', 'Candidates', 'Release'], sittings.map(e => [e.title, e.date, e.candidates, e.release]))}>Examination report</Action>{schedule}</>}/>
        <Sections counts={[banks.length, sittings.length]} labels={['Question banks', 'Examinations', 'Security and invigilation']} active={tab} change={setTab}/>
        {tab === 0 && <Card className="bank-list" title="Question banks" subtitle="Objective, short answer, essay and programming items kept per course" actions={<><Badge tone="emerald">{questionTotal} questions</Badge><Action size="sm" icon="plus" variant="primary" onClick={() => setBankId('new')}>New bank</Action></>}>
            <Table columns={['Bank', 'Items', 'Types', 'Access', '']} rows={banks.map(b => [
                <RecordName name={b.name} meta={`${b.course} · updated ${b.updated}`}/>, <span className="tnum text-[13px]">{b.questions}</span>, <span className="text-[13px] text-ink-500">{b.types}</span>,
                <Badge tone={b.security === 'restricted' ? 'amber' : 'slate'}>{b.security === 'restricted' ? 'Restricted to officers' : 'Open to lecturer'}</Badge>,
                <div className="flex justify-end"><Action size="sm" onClick={() => setBankId(b.id)}>Open bank</Action></div>,
            ])}/>
        </Card>}
        {tab === 1 && <Card title="Examinations" subtitle="Access window, attempt limit, accommodations and result release control" actions={<><Badge tone="sky">{sittings.filter(e => e.state === 'scheduled').length} scheduled</Badge>{schedule}</>}>
            <Table columns={['Examination', 'Date', 'Duration', 'Attempts', 'State', 'Result release', '']} rows={sittings.map(e => [
                <RecordName name={e.title} meta={e.course}/>, e.date, e.duration, `${e.attempts} / ${e.candidates}`, <Status value={e.state}/>, e.release, <Action size="sm" onClick={() => setExam(e)}>Blueprint</Action>,
            ])}/>
        </Card>}
        {tab === 2 && <SecurityPanel invigilationLog={invigilationLog} selected={selected} change={setSelected}/>}
        <Note>Each attempt keeps the paper that was actually drawn, so a result can be reproduced against the candidate record at any time.</Note>
        {bankId === 'new' && <Drawer title="New bank" close={() => setBankId('')}><Editor fields={[{ label: 'Bank name', required: true }, { label: 'Course', required: true }, { label: 'Types', initial: 'MCQ' }, { label: 'Access', options: ['restricted', 'open'] }]} save={v => {
            const id = crypto.randomUUID();
            setBanks([...banks, { id, name: v['Bank name'], course: v.Course, questions: 0, types: v.Types, security: v.Access, updated: new Date().toLocaleDateString() }]);
            setBankId(id);
        }}/></Drawer>}
        {bank && <BankPanel key={bankId} bank={bank} items={items[bank.id] ?? []} close={() => setBankId('')} add={q => {
            setQuestionTotal(n => n + 1);
            setItems({ ...items, [bank.id]: [...(items[bank.id] ?? []), q] });
            setBanks(banks.map(b => b.id === bank.id ? { ...b, questions: b.questions + 1 } : b));
        }}/>}
        {exam && <Blueprint data={blueprint} key={exam === 'new' ? exam : exam.id} exam={exam === 'new' ? undefined : exam} close={() => setExam(undefined)} save={v => {
            if (!exam) return;
            const base = exam === 'new' ? { id: crypto.randomUUID(), candidates: 0, attempts: 0, state: 'scheduled', release: 'Manual approval' } : exam;
            const updated = { ...base, title: v.Examination, course: v.Course, duration: `${v['Duration (minutes)']} min`, date: v['Access window opens'].replace('T', ' '), config: v };
            setSittings(exam === 'new' ? [...sittings, updated] : sittings.map(e => e.id === exam.id ? updated : e));
            setTab(1);
            setExam(undefined);
        }}/>}
    </div>;
}
