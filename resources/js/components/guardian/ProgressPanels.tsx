import { Meter, StudyIcon } from '@/components/learning/Parts';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { Table } from '@/components/ui/data-display/Table';

export function PublishedResults({
    results,
    onIssue,
}: {
    onIssue: () => void;
    results: {
        course: string;
        title: string;
        total: number;
        grade: string;
    }[];
}) {
    const rows = results.map((entry) => [
        <span key="course" className="font-mono text-[12px] text-ink-500">
            {entry.course}
        </span>,
        <span key="title" className="text-[13px] font-medium text-ink-800">
            {entry.title}
        </span>,
        <span key="score" className="text-[13px] font-semibold text-ink-900 tnum">
            {entry.total}
        </span>,
        <Badge key="grade" tone={entry.grade === 'A' ? 'emerald' : entry.grade === 'C' ? 'amber' : 'sky'}>
            {entry.grade}
        </Badge>,
    ]);

    return (
        <Card
            title="Published results"
            subtitle="Only results released by the Examinations Office are shown"
            actions={
                <Action
                    icon="help"
                    variant="outline"
                    size="sm"
                    onClick={onIssue}
                    disabled={!results.length}
                >
                    Report an issue
                </Action>
            }
        >
            <Table columns={['Course', 'Title', 'Score', 'Grade']} rows={rows} />
        </Card>
    );
}

export function Attendance({
    rows,
}: {
    rows: {
        course: string;
        value: number;
        tone: string;
    }[];
}) {
    return (
        <Card title="Attendance" subtitle="Percentage of sessions attended, updated after each register is closed">
            <div className="space-y-4">
                {rows.map((row) => (
                    <div key={row.course}>
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="truncate text-[13px] font-medium text-ink-800">{row.course}</span>
                            <span className="text-[12.5px] font-semibold text-ink-700 tnum">{row.value}%</span>
                        </div>
                        <Meter value={row.value} tone={row.tone} />
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function Deadlines({
    rows,
}: {
    rows: {
        item: string;
        course: string;
        due: string;
        state: string;
    }[];
}) {
    return (
        <Card title="Recent and upcoming dates" subtitle="Dates published to the whole cohort">
            <Table
                columns={['Item', 'Course', 'Date', 'State']}
                rows={rows.map((row) => [
                    <span key="item" className="text-[13px] text-ink-800">
                        {row.item}
                    </span>,
                    <span key="course" className="font-mono text-[12px] text-ink-500">
                        {row.course}
                    </span>,
                    <span key="due" className="text-[12.5px] text-ink-600">
                        {row.due}
                    </span>,
                    <Badge key="state" tone={row.state === 'Completed' ? 'emerald' : row.state === 'Attended' ? 'sky' : 'amber'}>
                        {row.state}
                    </Badge>,
                ])}
            />
        </Card>
    );
}

export function Materials({
    materials,
}: {
    materials: {
        name: string;
        size: string;
    }[];
}) {
    return (
        <Card title="Materials made available" subtitle="Only materials the lecturer has opened to guardians">
            <ul className="space-y-2">
                {materials.map((item) => (
                    <li key={item.name} className="flex items-center gap-2 text-[13px] text-ink-700">
                        <StudyIcon name="document" className="h-4 w-4 text-ink-400" />
                        <span className="min-w-0 flex-1 truncate">{item.name}</span>
                        <span className="shrink-0 text-[12px] text-ink-400">{item.size}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
