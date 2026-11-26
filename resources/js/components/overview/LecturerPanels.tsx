import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import { AreaChart, HorizontalBars } from './Charts';
import { CourseProgress, Go, RecordName } from './OverviewParts';
import { offerings, submissions } from './lecturerFixtures';

export function Courses() {
    return <Card title="My courses" subtitle="Allocated to you for this semester" actions={<Go to="lecturer/courses" icon="external">All courses</Go>}>
        <Table columns={['Course', 'Students', 'Mode', 'Completion', '']} rows={offerings.map(o => [
            <RecordName title={o.title} code={`${o.code} · ${o.term}`}/>,
            <span className="text-[13px] tnum">{o.students}</span>, <Badge tone="slate">{o.mode}</Badge>,
            <div className="w-28"><CourseProgress value={o.completion}/></div>,
            <div className="flex justify-end"><Go to="lecturer/course">Open</Go></div>,
        ])}/>
    </Card>;
}

export function Marking() {
    return <Card title="Waiting for you" subtitle="Submissions that cannot be released until they are marked" actions={<Badge tone="amber">2 new</Badge>}>
        <Table columns={['Student', 'Assignment', 'Submitted', 'Timing', '']} rows={submissions.map(s => [
            <RecordName title={s.student} code={s.matric}/>, <span className="text-[13px] text-ink-600">{s.assignment}</span>,
            <span className="text-[12.5px] text-ink-500">{s.submitted}</span>,
            <Badge tone={s.late ? 'amber' : 'emerald'}>{s.late ? 'Late' : 'On time'}</Badge>,
            <div className="flex justify-end"><Go to="lecturer/assignments">Mark</Go></div>,
        ])}/>
    </Card>;
}

const scores = [64, 61, 66, 63, 69, 68, 71, 70, 74, 72];
const performance = [
    { label: 'ACC302 submission rate', value: 75, color: '#10B981' },
    { label: 'ACC302 attendance', value: 92, color: '#3B82F6' },
    { label: 'ENG210 submission rate', value: 95, color: '#F59E0B' },
    { label: 'CHM401 submission rate', value: 88, color: '#10B981' },
];

export function Performance() {
    return <Card title="Class performance" subtitle="Mean score and submission rate across your courses">
        <div className="space-y-5">
            <AreaChart color="#10B981" height={190} labels={scores.map((_, i) => `W${i + 1}`)} values={scores} label="Mean score by week"/>
            <HorizontalBars items={performance}/>
        </div>
    </Card>;
}
