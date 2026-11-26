import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import type { Bank } from '@/types/assessments/cbt';
import { RecordName } from '../RecordDetails';

export function BankCatalogue({
    banks,
    questionTotal,
    open,
}: {
    banks: Bank[];
    questionTotal: number;
    open: (id: string) => void;
}) {
    return (
        <Card
            className="bank-list"
            title="Question banks"
            subtitle="Objective, short answer, essay and programming items kept per course"
            actions={
                <>
                    <Badge tone="emerald">{questionTotal} questions</Badge>
                    <Action
                        size="sm"
                        icon="plus"
                        variant="primary"
                        onClick={() => open('new')}
                    >
                        New bank
                    </Action>
                </>
            }
        >
            <Table
                columns={['Bank', 'Items', 'Types', 'Access', '']}
                rowKeys={banks.map((bank) => bank.id)}
                rows={banks.map((b) => [
                    <RecordName key="bank" name={b.name} meta={`${b.course} · updated ${b.updated}`} />,
                    <span key="items" className="tnum text-[13px]">
                        {b.questions}
                    </span>,
                    <span key="types" className="text-[13px] text-ink-500">
                        {b.types}
                    </span>,
                    <Badge key="access" tone={b.security === 'restricted' ? 'amber' : 'slate'}>
                        {b.security === 'restricted' ? 'Restricted to officers' : 'Open to lecturer'}
                    </Badge>,
                    <div key="actions" className="flex justify-end">
                        <Action size="sm" onClick={() => open(b.id)}>
                            Open bank
                        </Action>
                    </div>,
                ])}
            />
        </Card>
    );
}
