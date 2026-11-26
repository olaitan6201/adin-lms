import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Table } from '@/components/ui/data-display/Table';
import type { Bank, BankDraft, Question, Exam, SittingDraft, BlueprintData, LogEntry } from '@/types/assessments/cbt';
import { Note, RecordName, Sections, Status, exportSheet } from './Controls';
import { BankPanel, NewBankPanel, SecurityPanel, guards } from './CbtPanels';
import { Blueprint } from './SittingBlueprint';

export default function CbtDesk({
    exams,
    questionBanks,
    total,
    bankItems,
    blueprint,
    invigilationLog,
}: {
    exams: Exam[];
    questionBanks: Bank[];
    total: number;
    bankItems: Record<string, Question[]>;
    blueprint: BlueprintData;
    invigilationLog: LogEntry[];
}) {
    const [tab, setTab] = useState(0);
    const [catalogue, setCatalogue] = useState({ banks: questionBanks, items: bankItems, questionTotal: total });
    const { banks, items, questionTotal } = catalogue;
    const [sittings, setSittings] = useState<Exam[]>(exams);
    const [bankId, setBankId] = useState('');
    const [exam, setExam] = useState<Exam | 'new'>();
    const [selected, setSelected] = useState(guards.slice(0, 4));
    const bank = banks.find((b) => b.id === bankId);

    function createBank(draft: BankDraft) {
        const created = { ...draft, id: crypto.randomUUID(), questions: 0, updated: new Date().toLocaleDateString() };
        setCatalogue((current) => ({ ...current, banks: [...current.banks, created] }));
        setBankId(created.id);
    }

    function addQuestion(question: Question) {
        if (!bank) return;
        const id = bank.id;
        setCatalogue((current) => ({
            items: { ...current.items, [id]: [...(current.items[id] ?? []), question] },
            banks: current.banks.map((row) => (row.id === id ? { ...row, questions: row.questions + 1 } : row)),
            questionTotal: current.questionTotal + 1,
        }));
    }

    function saveSitting(draft: SittingDraft) {
        if (!exam) return;
        const base =
            exam === 'new'
                ? { id: crypto.randomUUID(), candidates: 0, attempts: 0, state: 'scheduled', release: 'Manual approval' }
                : exam;
        const updated = { ...base, ...draft };
        setSittings((current) =>
            exam === 'new' ? [...current, updated] : current.map((row) => (row.id === updated.id ? updated : row)),
        );
        setTab(1);
        setExam(undefined);
    }

    function exportExaminations() {
        exportSheet(
            'examination-report',
            ['Examination', 'Date', 'Candidates', 'Release'],
            sittings.map(exam => [exam.title, exam.date, exam.candidates, exam.release]),
        );
    }

    const schedule = (
        <Action variant="primary" icon="plus" onClick={() => setExam('new')}>
            Schedule examination
        </Action>
    );
    return (
        <div className="assessment-view space-y-5">
            <PageHeader
                eyebrow="Examination"
                title="CBT examinations"
                description="Build banks, schedule sittings, run them under controlled access, and hold results until an officer releases them."
                actions={
                    <>
                        <Action icon="chart" onClick={exportExaminations}>
                            Examination report
                        </Action>
                        {schedule}
                    </>
                }
            />
            <Sections
                counts={[banks.length, sittings.length]}
                labels={['Question banks', 'Examinations', 'Security and invigilation']}
                active={tab}
                change={setTab}
            />
            {tab === 0 && (
                <Card
                    className="bank-list"
                    title="Question banks"
                    subtitle="Objective, short answer, essay and programming items kept per course"
                    actions={
                        <>
                            <Badge tone="emerald">{questionTotal} questions</Badge>
                            <Action size="sm" icon="plus" variant="primary" onClick={() => setBankId('new')}>
                                New bank
                            </Action>
                        </>
                    }
                >
                    <Table
                        columns={['Bank', 'Items', 'Types', 'Access', '']}
                        rowKeys={banks.map(bank => bank.id)}
                        rows={banks.map((b) => [
                            <RecordName name={b.name} meta={`${b.course} · updated ${b.updated}`} />,
                            <span className="tnum text-[13px]">{b.questions}</span>,
                            <span className="text-[13px] text-ink-500">{b.types}</span>,
                            <Badge tone={b.security === 'restricted' ? 'amber' : 'slate'}>
                                {b.security === 'restricted' ? 'Restricted to officers' : 'Open to lecturer'}
                            </Badge>,
                            <div className="flex justify-end">
                                <Action size="sm" onClick={() => setBankId(b.id)}>
                                    Open bank
                                </Action>
                            </div>,
                        ])}
                    />
                </Card>
            )}
            {tab === 1 && (
                <Card
                    title="Examinations"
                    subtitle="Access window, attempt limit, accommodations and result release control"
                    actions={
                        <>
                            <Badge tone="sky">{sittings.filter((e) => e.state === 'scheduled').length} scheduled</Badge>
                            {schedule}
                        </>
                    }
                >
                    <Table
                        columns={['Examination', 'Date', 'Duration', 'Attempts', 'State', 'Result release', '']}
                        rowKeys={sittings.map(sitting => sitting.id)}
                        rows={sittings.map((e) => [
                            <RecordName name={e.title} meta={e.course} />,
                            e.date,
                            e.duration,
                            `${e.attempts} / ${e.candidates}`,
                            <Status value={e.state} />,
                            e.release,
                            <Action size="sm" onClick={() => setExam(e)}>
                                Blueprint
                            </Action>,
                        ])}
                    />
                </Card>
            )}
            {tab === 2 && <SecurityPanel invigilationLog={invigilationLog} selected={selected} change={setSelected} />}
            <Note>
                Each attempt keeps the paper that was actually drawn, so a result can be reproduced against the candidate record at any
                time.
            </Note>
            {bankId === 'new' && <NewBankPanel close={() => setBankId('')} save={createBank} />}
            {bank && (
                <BankPanel key={bank.id} bank={bank} items={items[bank.id] ?? []} close={() => setBankId('')} add={addQuestion} />
            )}
            {exam && (
                <Blueprint
                    data={blueprint}
                    key={exam === 'new' ? exam : exam.id}
                    exam={exam === 'new' ? undefined : exam}
                    close={() => setExam(undefined)}
                    save={saveSitting}
                />
            )}
        </div>
    );
}
