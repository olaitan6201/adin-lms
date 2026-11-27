import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import type { Assignment, Receipt, StudentWork } from '@/types/assessments/assignments';
import { Badge } from '@/components/ui/data-display/Badge';

const displayTitle = (a?: Assignment) => a?.shortTitle ?? a?.title;

function SubmittedWork({
    assignment,
    receipt,
    grade,
    open,
}: {
    assignment: Assignment;
    receipt: Receipt;
    grade?: number;
    open: (assignment: Assignment) => void;
}) {
    return (
        <li className="flex items-start gap-3 py-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                <Icon name="document" className="size-4" />
            </span>
            <button type="button" className="min-w-0 flex-1 text-left" onClick={() => open(assignment)}>
                <span className="block truncate text-[13px] font-medium text-ink-800">
                    {displayTitle(assignment)}
                </span>
                <small className="mt-0.5 block text-[11.5px] text-ink-400">
                    {receipt.time} · {receipt.size}
                </small>
            </button>
            <Badge tone={grade === undefined ? 'amber' : 'emerald'}>
                {grade === undefined ? 'Awaiting marking' : `Graded ${grade}`}
            </Badge>
        </li>
    );
}

export function SubmittedWorkList({
    records,
    openAssignment,
}: {
    records: StudentWork[];
    openAssignment: (assignment: Assignment) => void;
}) {
    return (
        <Card title="Submitted work" subtitle="Your uploads and their receipts">
            <ul className="divide-y divide-ink-100">
                {records.map(({ assignment, current }) => {
                    if (!current) {
                        return null;
                    }

                    return (
                        <SubmittedWork
                            key={assignment.id}
                            assignment={assignment}
                            receipt={current.receipt}
                            grade={current.feedback?.score}
                            open={openAssignment}
                        />
                    );
                })}
            </ul>
        </Card>
    );
}
