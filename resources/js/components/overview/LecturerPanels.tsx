import type { Offering, Submission, MetricBar } from './panelTypes';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import { AreaChart, HorizontalBars } from './Charts';
import { CourseProgress, Go, RecordName } from './OverviewParts';

export function Courses({ offerings }: { offerings: readonly Offering[] }) {
    return <Card title="My courses" subtitle="Allocated to you for this semester" actions={<Go to="lecturer/courses" icon="external">All courses</Go>}>
        <Table columns={['Course', 'Students', 'Mode', 'Completion', '']} rows={offerings.map(o => [
            <RecordName title={o.title} code={`${o.code} · ${o.term}`}/>,
            <span className="text-[13px] tnum">{o.students}</span>, <Badge tone="slate">{o.mode}</Badge>,
            <div className="w-28"><CourseProgress value={o.completion}/></div>,
            <div className="flex justify-end"><Go to="lecturer/course">Open</Go></div>,
        ])}/>
    </Card>;
}

export function Marking({ submissions }: { submissions: readonly Submission[] }) {
    return <Card title="Waiting for you" subtitle="Submissions that cannot be released until they are marked" actions={<Badge tone="amber">{submissions.length} new</Badge>}>
        <Table columns={['Student', 'Assignment', 'Submitted', 'Timing', '']} rows={submissions.map(s => [
            <RecordName title={s.student} code={s.matric}/>, <span className="text-[13px] text-ink-600">{s.assignment}</span>,
            <span className="text-[12.5px] text-ink-500">{s.submitted}</span>,
            <Badge tone={s.late ? 'amber' : 'emerald'}>{s.late ? 'Late' : 'On time'}</Badge>,
            <div className="flex justify-end"><Go to="lecturer/assignments">Mark</Go></div>,
        ])}/>
    </Card>;
}

export function Performance({ scores, performance }: { scores: readonly number[]; performance: readonly MetricBar[] }) {
    return <Card title="Class performance" subtitle="Mean score and submission rate across your courses">
        <div className="space-y-5">
            <AreaChart color="#10B981" height={190} labels={scores.map((_, i) => `W${i + 1}`)} values={scores} label="Mean score by week"/>
            <HorizontalBars items={performance}/>
        </div>
    </Card>;
}
