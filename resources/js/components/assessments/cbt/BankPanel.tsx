import { useState } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Bank, Question } from '@/types/assessments/cbt';
import { Drawer } from '../Drawer';
import { Status } from '../RecordDetails';
import { Note } from '@/components/ui/feedback/Note';
import { type Values, Editor } from '../Editor';

const types = ['MCQ', 'True/False', 'Matching', 'Gap-fill', 'Short answer', 'Essay', 'Programming'];
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
                    rowKeys={items.map((question) => question.id)}
                    rows={items.map((q, i) => [
                        i + 1,
                        <Status key="type" value={q.type} />,
                        q.stem,
                        q.marks,
                        <Status key="level" value={q.difficulty} />,
                    ])}
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
                Question text is only visible to authorised roles. Opening a bank is written to the audit log
                with the officer and the time.
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
