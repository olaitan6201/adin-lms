import { progress, guardian, withheld } from '@/data/learning/guardian';
import { GuardianIdentity, Withheld } from '@/components/learning/GuardianIdentity';
import { Meter, Note, StudyIcon } from '@/components/learning/Parts';
import { studentResults, offlineDownloads } from '@/data/learning/courseWorkspace';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { Table } from '@/components/ui/data-display/Table';
import { PageHeader } from '@/components/ui/layout/PageHeader';

function PublishedResults({ results }: { results: typeof studentResults }) {
    const rows = results.map((entry) => [
        <span className="font-mono text-[12px] text-ink-500">{entry.course}</span>,
        <span className="text-[13px] font-medium text-ink-800">{entry.title}</span>,
        <span className="text-[13px] font-semibold text-ink-900 tnum">{entry.total}</span>,
        <Badge tone={entry.grade === 'A' ? 'emerald' : entry.grade === 'C' ? 'amber' : 'sky'}>{entry.grade}</Badge>,
    ]);

    return (
        <Card
            title="Published results"
            subtitle="Only results released by the Examinations Office are shown"
            actions={
                <Action icon="help" variant="outline" size="sm">
                    Report an issue
                </Action>
            }
        >
            <Table columns={['Course', 'Title', 'Score', 'Grade']} rows={rows} />
        </Card>
    );
}
function Attendance({ rows }: { rows: typeof progress.attendance }) {
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
function Deadlines({ rows }: { rows: typeof progress.deadlines }) {
    return (
        <Card title="Recent and upcoming dates" subtitle="Dates published to the whole cohort">
            <Table
                columns={['Item', 'Course', 'Date', 'State']}
                rows={rows.map((row) => [
                    <span className="text-[13px] text-ink-800">{row.item}</span>,
                    <span className="font-mono text-[12px] text-ink-500">{row.course}</span>,
                    <span className="text-[12.5px] text-ink-600">{row.due}</span>,
                    <Badge tone={row.state === 'Completed' ? 'emerald' : row.state === 'Attended' ? 'sky' : 'amber'}>{row.state}</Badge>,
                ])}
            />
        </Card>
    );
}
function Materials({ materials }: { materials: typeof offlineDownloads }) {
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
export default function Progress() {
    return (
        <div className="learning-surface">
            <PageHeader
                eyebrow="Guardian access"
                title="Approved progress"
                description="The published record of the student you are linked to. Nothing else about that student is shown."
                actions={
                    <>
                        <Action icon="mail" variant="outline">
                            Ask a question
                        </Action>
                        <Action icon="shield" variant="primary">
                            Manage consent
                        </Action>
                    </>
                }
            />

            <div className="space-y-5">
                <Note tone="sky">
                    A guardian account can never widen its own scope. A change to what is visible is made by the Registrar against the consent
                    form, and the previous scope is kept in the audit log.
                </Note>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <GuardianIdentity guardian={guardian} />
                    <Withheld items={withheld} />
                </div>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                    <div className="space-y-5">
                        <PublishedResults results={studentResults.filter((entry) => entry.state === 'released')} />
                        <Deadlines rows={progress.deadlines} />
                    </div>
                    <div className="space-y-5">
                        <Attendance rows={progress.attendance} />
                        <Materials materials={offlineDownloads.slice(0, 3)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
