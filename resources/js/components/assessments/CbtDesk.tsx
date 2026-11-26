import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import type { Bank, Question, Exam, SittingDraft, BlueprintData, LogEntry } from '@/types/assessments/cbt';
import { Note } from '@/components/ui/feedback/Note';
import { Sections } from './Sections';
import { exportSheet } from '@/lib/csv';
import { BankPanel } from './cbt/BankPanel';
import { guards, SecurityPanel } from './cbt/SecurityPanel';
import { NewBankPanel } from './cbt/NewBankPanel';
import { Blueprint } from './SittingBlueprint';
import { BankCatalogue } from './cbt/BankCatalogue';
import { SittingList } from './cbt/SittingList';
import { useBankCatalogue } from './cbt/useBankCatalogue';
import { windowError } from './cbt/sittingWindow';

export default function CbtDesk({
    officer,
    exams,
    questionBanks,
    bankItems,
    blueprint,
    invigilationLog,
}: {
    officer: boolean;
    exams: Exam[];
    questionBanks: Bank[];
    bankItems: Record<string, Question[]>;
    blueprint: BlueprintData;
    invigilationLog: LogEntry[];
}) {
    const [tab, setTab] = useState(0);
    const { banks, items, questionTotal, bank, bankId, setBankId, createBank, addQuestion } =
        useBankCatalogue(questionBanks, bankItems, officer);
    const [sittings, setSittings] = useState<Exam[]>(exams);
    const [exam, setExam] = useState<Exam | 'new'>();
    const [selected, setSelected] = useState(guards.slice(0, 4));

    function saveSitting(draft: SittingDraft) {
        if (!exam || windowError(draft.window)) {
            return;
        }

        const base =
            exam === 'new'
                ? {
                      id: crypto.randomUUID(),
                      candidates: 0,
                      attempts: 0,
                      state: 'scheduled',
                      release: 'Manual approval',
                  }
                : exam;
        const updated = { ...base, ...draft };
        setSittings((current) =>
            exam === 'new'
                ? [...current, updated]
                : current.map((row) => (row.id === updated.id ? updated : row)),
        );
        setTab(1);
        setExam(undefined);
    }

    function exportExaminations() {
        exportSheet(
            'examination-report',
            ['Examination', 'Date', 'Candidates', 'Release'],
            sittings.map((exam) => [exam.title, exam.date, exam.candidates, exam.release]),
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
                <BankCatalogue
                    officer={officer}
                    banks={banks}
                    questionTotal={questionTotal}
                    open={setBankId}
                />
            )}
            {tab === 1 && <SittingList sittings={sittings} schedule={schedule} open={setExam} />}
            {tab === 2 && (
                <SecurityPanel invigilationLog={invigilationLog} selected={selected} change={setSelected} />
            )}
            <Note>
                Each attempt keeps the paper that was actually drawn, so a result can be reproduced against
                the candidate record at any time.
            </Note>
            {bankId === 'new' && <NewBankPanel officer={officer} close={() => setBankId('')} save={createBank} />}
            {bank && (
                <BankPanel
                    key={bank.id}
                    bank={bank}
                    items={items[bank.id] ?? []}
                    close={() => setBankId('')}
                    add={addQuestion}
                />
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
