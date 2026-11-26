import { studentResults as releasedResults } from '@/components/study-workspace/fixtures';
import { StatTile, Badge, Card, Action, Table, PageHeader } from '@/components/workspace/Elements';
import { Note, StudyIcon } from '@/components/study-workspace/Parts';

export default function Results() {
    const rows = releasedResults.map((result) => [
        <span className="font-mono text-[12px] font-medium text-ink-700">{result.course}</span>,
        <span className="font-medium text-ink-800">{result.title}</span>,
        <span className="text-[13px] tnum">{result.ca}</span>,
        <span className="text-[13px] tnum">{result.mid}</span>,
        <span className="text-[13px] tnum">{result.final}</span>,
        <span className="text-[13px] font-semibold tnum">{result.total}</span>,
        <Badge tone={result.grade === 'Pending' ? 'amber' : result.grade === 'A' ? 'emerald' : 'slate'}>{result.grade}</Badge>,
    ]);

    return (
        <>
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
                    {[
                        { label: 'GPA this session', value: '4.12', hint: '5 point scale' },
                        { label: 'Units registered', value: '12', hint: 'of 15 required' },
                        { label: 'Units earned', value: '12', hint: 'no outstanding units' },
                        { label: 'Class position', value: '14', hint: 'of 68 in programme' },
                    ].map((metric) => (
                        <StatTile key={metric.label} label={metric.label} value={metric.value} deltaLabel={metric.hint} />
                    ))}
                </div>

                <Card
                    title="Released scores"
                    subtitle="Continuous assessment, mid-term and final components"
                    actions={
                        <>
                            <Badge tone="emerald">3 released</Badge>
                            <Badge tone="amber">1 pending</Badge>
                        </>
                    }
                >
                    <Table columns={['Code', 'Course', 'CA', 'Mid', 'Final', 'Total', 'Grade']} rows={rows} />
                </Card>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <Card title="Session history" subtitle="Scores from previous sessions">
                        <ul className="divide-y divide-ink-100">
                            {[
                                { session: '2024/2025', courses: '6 courses', gpa: '3.94', units: '18 units earned' },
                                { session: '2023/2024', courses: '6 courses', gpa: '3.71', units: '18 units earned' },
                            ].map((entry) => (
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
                    <Card title="How these numbers were produced" subtitle="The policy behind your score sheet">
                        <>
                            <ul className="space-y-2.5">
                                {[
                                    'Continuous assessment counts for 30 percent of each course.',
                                    'The mid-term counts for 20 percent and is marked automatically for objective items.',
                                    'The final examination counts for 40 percent and is moderated before release.',
                                    'Scores appear here only after an authorised officer publishes them.',
                                ].map((rule) => (
                                    <li key={rule} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-600">
                                        <span className="mt-0.5 shrink-0 text-brand-600">
                                            <StudyIcon name="check" className="w-4 h-4" />
                                        </span>
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 rounded-xl bg-ink-50 p-3.5">
                                <p className="text-[12px] font-semibold text-ink-700">Query a result</p>
                                <p className="mt-1 text-xs leading-relaxed text-ink-500">
                                    If a score looks wrong, message the examination officer through Communication. Queries are recorded against
                                    the result.
                                </p>
                            </div>
                        </>
                    </Card>
                </div>

                <Note tone="amber">
                    Only released results appear here. A result under moderation stays hidden until it is approved and published.
                </Note>
            </div>
        </>
    );
}
