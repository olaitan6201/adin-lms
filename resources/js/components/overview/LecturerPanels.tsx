import type { Offering, Submission, MetricBar } from './panelTypes';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import { AreaChart, HorizontalBars } from './Charts';
import { CourseProgress, Go, RecordName } from './OverviewParts';

export function Courses({ offerings }: { offerings: readonly Offering[] }) {
    return (
        <Card
            className="overview-actions"
            title="My courses"
            subtitle="Allocated to you for this semester"
            actions={
                <Go to="lecturer/courses" icon="external">
                    All courses
                </Go>
            }
        >
            <Table
                columns={['Course', 'Students', 'Mode', 'Completion', '']}
                rows={offerings.map((o) => [
                    <RecordName key="course" title={o.title} code={`${o.code} · ${o.term}`} />,
                    <span key="enrolment" className="text-[13px] tnum">
                        {o.students}
                    </span>,
                    <Badge key="mode" tone="slate">
                        {o.mode}
                    </Badge>,
                    <div key="progress" className="w-28">
                        <CourseProgress value={o.completion} />
                    </div>,
                    <div key="actions" className="flex justify-end">
                        <Go to="lecturer/course">Open</Go>
                    </div>,
                ])}
            />
        </Card>
    );
}

export function Marking({ submissions }: { submissions: readonly Submission[] }) {
    return (
        <Card
            className="overview-actions"
            title="Waiting for you"
            subtitle="Submissions that cannot be released until they are marked"
            actions={<Badge tone="amber">{submissions.length} new</Badge>}
        >
            <Table
                columns={['Student', 'Assignment', 'Submitted', 'Timing', '']}
                rows={submissions.map((s) => [
                    <RecordName key="student" title={s.student} code={s.matric} />,
                    <span key="assignment" className="text-[13px] text-ink-600">
                        {s.assignment}
                    </span>,
                    <span key="submitted" className="text-[12.5px] text-ink-500">
                        {s.submitted}
                    </span>,
                    <Badge key="status" tone={s.late ? 'amber' : 'emerald'}>
                        {s.late ? 'Late' : 'On time'}
                    </Badge>,
                    <div key="actions" className="flex justify-end">
                        <Go to="lecturer/assignments">Mark</Go>
                    </div>,
                ])}
            />
        </Card>
    );
}

type PerformanceProps = {
    scores: readonly number[];
    performance: readonly MetricBar[];
};

export function Performance({ scores, performance }: PerformanceProps) {
    return (
        <Card title="Class performance" subtitle="Mean score and submission rate across your courses">
            <div className="space-y-5">
                <AreaChart
                    color="#10B981"
                    height={190}
                    labels={scores.map((_, i) => `W${i + 1}`)}
                    values={scores}
                    label="Mean score by week"
                />
                <HorizontalBars items={performance} />
            </div>
        </Card>
    );
}
