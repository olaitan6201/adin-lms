import type { StudentCourse, PendingWork, Result, Notice } from './panelTypes';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import { Go, RecordName } from './OverviewParts';
export { ContinueLearning } from './ContinueLearning';

type CoursesProps = {
    courses: readonly StudentCourse[];
    subtitle: string;
};

export function Courses({ courses, subtitle }: CoursesProps) {
    return (
        <Card
            className="overview-actions-wide"
            title="My courses"
            subtitle={subtitle}
            actions={
                <Go to="student/courses" icon="external">
                    All courses
                </Go>
            }
        >
            <Table
                columns={['Course', 'Progress', 'Lessons', '']}
                rows={courses.map((c) => [
                    <RecordName key="course" title={c.title} code={c.code} />,
                    <div key="progress" className="w-32 space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-ink-700 tnum">{c.value}%</span>
                        </div>
                        <div className="prog-track">
                            <div className="prog-fill bg-brand-500" style={{ width: `${c.value}%` }} />
                        </div>
                    </div>,
                    <Badge key="lessons" tone="slate">
                        {c.lessons}
                    </Badge>,
                    <div key="actions" className="flex justify-end">
                        <Go to="student/course">Continue</Go>
                    </div>,
                ])}
            />
        </Card>
    );
}

export function Pending({ pending }: { pending: readonly PendingWork[] }) {
    return (
        <Card
            className="overview-actions"
            title="Pending assignments"
            subtitle="Work that is outstanding across your courses"
            actions={<Badge tone="amber">{pending.length} outstanding</Badge>}
        >
            <Table
                columns={['Assignment', 'Due', 'Status', '']}
                rows={pending.map((a) => [
                    <div key="assignment" className="min-w-0">
                        <p className="truncate font-medium text-ink-800">{a.title}</p>
                        <p className="truncate text-[11px] text-ink-400">{a.course}</p>
                    </div>,
                    <span key="due" className="text-[13px] text-ink-600">
                        {a.due}
                    </span>,
                    <Badge key="status" tone={a.tone}>
                        {a.state}
                    </Badge>,
                    <div key="actions" className="flex justify-end">
                        <Go to="student/assignments">Open</Go>
                    </div>,
                ])}
            />
        </Card>
    );
}

export function Results({ studentResults }: { studentResults: readonly Result[] }) {
    return (
        <Card
            title="Released results"
            subtitle="Scores released to you by the examination officer"
            actions={
                <Go to="student/results" icon="external">
                    All results
                </Go>
            }
        >
            <Table
                columns={['Code', 'Course', 'CA', 'Mid', 'Total', 'Grade']}
                rows={studentResults.map((r) => [
                    <span key="course" className="font-mono text-[12px] font-medium text-ink-700">
                        {r.course}
                    </span>,
                    <span key="title" className="font-medium text-ink-800">
                        {r.title}
                    </span>,
                    <span key="assessment" className="text-[13px] tnum">
                        {r.ca}
                    </span>,
                    <span key="midterm" className="text-[13px] tnum">
                        {r.mid}
                    </span>,
                    <span key="total" className="text-[13px] font-semibold tnum">
                        {r.total}
                    </span>,
                    <Badge key="grade" tone={r.state === 'released' ? 'emerald' : 'amber'}>
                        {r.grade}
                    </Badge>,
                ])}
            />
        </Card>
    );
}

export function Notices({ notifications }: { notifications: readonly Notice[] }) {
    return (
        <Card title="Notices for you" subtitle="Published to the whole cohort">
            <ul className="divide-y divide-ink-100">
                {notifications.map((n) => (
                    <li key={n.id} className="py-3">
                        <p className="text-[13px] font-medium text-ink-800">{n.title}</p>
                        <p className="mt-0.5 text-xs text-ink-500">{n.meta}</p>
                        <p className="mt-1 text-[11px] text-ink-400">{n.time}</p>
                    </li>
                ))}
            </ul>
        </Card>
    );
}
