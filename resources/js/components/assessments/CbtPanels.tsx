import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Bank, BankDraft, Question, LogEntry } from '@/types/assessments/cbt';
import { Drawer, Note, Status, exportSheet, type Values } from './Controls';
import { Checks, Editor } from './Editor';

const types = ['MCQ', 'True/False', 'Matching', 'Gap-fill', 'Short answer', 'Essay', 'Programming'];
export const guards = [
    'Identity check against the registered candidate',
    'Invigilator present for the full access window',
    'Random draw of questions per attempt, options shuffled',
    'Browser restrictions where the device supports them',
    'Additional time for approved accommodations',
];

export function NewBankPanel({ close, save }: { close: () => void; save: (draft: BankDraft) => void }) {
    function submit(values: Values) {
        save({ name: values['Bank name'], course: values.Course, types: values.Types, security: values.Access });
    }

    return (
        <Drawer title="New bank" close={close}>
            <Editor
                fields={[
                    { label: 'Bank name', required: true },
                    { label: 'Course', required: true },
                    { label: 'Types', initial: 'MCQ' },
                    { label: 'Access', options: ['restricted', 'open'] },
                ]}
                save={submit}
            />
        </Drawer>
    );
}

export function BankPanel({
    bank,
    items,
    add,
    close,
}: {
    bank: Bank;
    items: Question[];
    add: (q: Question) => void;
    close: () => void;
}) {
    const [adding, setAdding] = useState(false);
    function saveQuestion(values: Values) {
        add({
            id: crypto.randomUUID(),
            no: items.length + 1,
            stem: values.Stem,
            type: values.Type,
            marks: Number(values.Marks),
            difficulty: values.Level,
            answered: 0,
        });
        setAdding(false);
    }

    return (
        <Drawer
            title={bank.name}
            subtitle={`${bank.questions} questions · ${bank.security === 'restricted' ? 'restricted to examination officers' : 'open to lecturer'}`}
            close={close}
        >
            <Card title="Questions in this bank">
                <Table
                    columns={['#', 'Type', 'Stem', 'Marks', 'Level']}
                    rowKeys={items.map(question => question.id)}
                    rows={items.map((q, i) => [i + 1, <Status value={q.type} />, q.stem, q.marks, <Status value={q.difficulty} />])}
                />
            </Card>
            {adding && (
                <Editor
                    fields={[
                        { label: 'Stem', type: 'textarea', required: true },
                        { label: 'Type', options: types },
                        { label: 'Marks', type: 'number', min: 1, initial: '2', required: true },
                        { label: 'Level', options: ['Easy', 'Medium', 'Hard'] },
                    ]}
                    label="Save question"
                    save={saveQuestion}
                />
            )}
            <Note amber>
                Question text is only visible to authorised roles. Opening a bank is written to the audit log with the officer and the
                time.
            </Note>
            <div className="flex justify-end gap-2">
                <Action onClick={close}>Close</Action>
                <Action variant="primary" onClick={() => setAdding(!adding)}>
                    {adding ? 'Cancel' : 'Add question'}
                </Action>
            </div>
        </Drawer>
    );
}

export function SecurityPanel({
    selected,
    change,
    invigilationLog,
}: {
    invigilationLog: LogEntry[];
    selected: string[];
    change: (v: string[]) => void;
}) {
    return (
        <div className="grid gap-5 lg:grid-cols-2">
            <Card
                title="Invigilation log"
                subtitle="Identity checks, browser guard events and submissions during a sitting"
                actions={
                    <Action
                        size="sm"
                        onClick={() =>
                            exportSheet(
                                'invigilation-log',
                                ['Time', 'Event', 'Actor', 'Level'],
                                invigilationLog.map((r) => [r.time, r.event, r.actor, r.level]),
                            )
                        }
                    >
                        Full log
                    </Action>
                }
            >
                <ol className="divide-y divide-slate-100">
                    {invigilationLog.map((r) => (
                        <li key={r.time} className="flex gap-3 py-3">
                            <span
                                className={`mt-2 size-2 shrink-0 rounded-full ${r.level === 'warn' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            />
                            <div>
                                {r.event}
                                <small className="block text-slate-500">
                                    {r.time} · {r.actor}
                                </small>
                            </div>
                        </li>
                    ))}
                </ol>
            </Card>
            <Card title="Controls applied to a sitting" subtitle="Identity, invigilation, question design and browser restrictions">
                <Checks labels={guards} selected={selected} change={change} />
                <p className="mt-3 text-xs text-slate-600">
                    Suspicious events are logged for officer review. Device capabilities limit browser restrictions.
                </p>
            </Card>
        </div>
    );
}
