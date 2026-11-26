import { standing } from '@/data/learning/results';
import { studentResults as releasedResults } from '@/data/learning/courseWorkspace';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { Table } from '@/components/ui/data-display/Table';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { StudyMetric, Note } from '@/components/learning/Parts';
import { ResultPolicy } from '@/components/students/ResultPolicy';

function SessionHistory({ history }: { history: typeof standing.history }) {
    return (
        <Card title="Session history" subtitle="Scores from previous sessions">
            <ul className="divide-y divide-ink-100">
                {history.map((entry) => (
                    <li key={entry.session} className="flex items-center justify-between gap-3 py-3">
                        <div>
                            <p className="text-[13px] font-medium text-ink-800">{entry.session}</p>
                            <p className="mt-0.5 text-xs text-ink-500">
                                {entry.courses} · {entry.units}
                            </p>
                        </div>
                        <span className="text-[15px] font-semibold text-ink-900 tnum">{entry.gpa}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
}

export default function Results() {
    const rows = releasedResults.map((result) => [
        <span key="course" className="font-mono text-[12px] font-medium text-ink-700">
            {result.course}
        </span>,
        <span key="title" className="font-medium text-ink-800">
            {result.title}
        </span>,
        <span key="ca" className="text-[13px] tnum">
            {result.ca}
        </span>,
        <span key="mid" className="text-[13px] tnum">
            {result.mid}
        </span>,
        <span key="final" className="text-[13px] tnum">
            {result.final}
        </span>,
        <span key="total" className="text-[13px] font-semibold tnum">
            {result.total}
        </span>,
        <Badge key="grade" tone={result.grade === 'Pending' ? 'amber' : result.grade === 'A' ? 'emerald' : 'slate'}>
            {result.grade}
        </Badge>,
    ]);

    return (
        <div className="learning-surface">
            <PageHeader
                eyebrow="Assessment"
                title="Results"
                description="Scores released to you by the examination officer, with the cumulative standing for the session."
                actions={
                    <Action icon="sheet" variant="outline">
                        Download result sheet
                    </Action>
                }
            />

            <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {standing.metrics.map((metric) => (
                        <StudyMetric key={metric.label} {...metric} />
                    ))}
                </div>

                <Card
                    title="Released scores"
                    subtitle="Continuous assessment, mid-term and final components"
                    actions={
                        <>
                            <Badge tone="emerald">{standing.released}</Badge>
                            <Badge tone="amber">{standing.pending}</Badge>
                        </>
                    }
                >
                    <Table columns={['Code', 'Course', 'CA', 'Mid', 'Final', 'Total', 'Grade']} rows={rows} />
                </Card>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <SessionHistory history={standing.history} />
                    <ResultPolicy policy={standing.policy} />
                </div>

                <Note tone="amber">
                    Only released results appear here. A result under moderation stays hidden until it is approved and published.
                </Note>
            </div>
        </div>
    );
}
