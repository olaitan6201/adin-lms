import type { StudentCourse, PendingWork, Lesson, Result, Notice } from './panelTypes';
import { Action } from '@/components/ui/controls/Action';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Table } from '@/components/ui/data-display/Table';
import { Go, RecordName } from './OverviewParts';

function CompletionRing({ progress, code }: Pick<Lesson, 'progress' | 'code'>) {
    const circumference = 2 * Math.PI * 43.5;
    return <div className="relative inline-flex size-24 shrink-0" role="img" aria-label={`Progress ${progress} percent`}>
        <svg viewBox="0 0 96 96" className="size-full -rotate-90"><circle cx="48" cy="48" r="43.5" fill="none" stroke="#E7ECF1" strokeWidth="9"/>
            <circle cx="48" cy="48" r="43.5" fill="none" stroke="#10B981" strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress / 100)}/></svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold text-ink-900 tnum">{progress}%</span><span className="text-[10px] font-medium uppercase tracking-wide text-ink-400">{code}</span></span>
    </div>;
}

export function ContinueLearning({ lesson, save }: { lesson: Lesson; save: () => void }) {
    return <Card title="Continue learning" subtitle="The lesson you were last working on">
        <div className="space-y-5"><div className="flex flex-wrap items-center gap-5"><CompletionRing code={lesson.code} progress={lesson.progress}/>
            <div className="min-w-0 flex-1"><p className="text-[14px] font-semibold text-ink-900">{lesson.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{lesson.description}</p>
                <div className="mt-3 flex flex-wrap gap-2"><Go to="student/course" primary>Resume lesson</Go>
                    <Action variant="outline" size="sm" onClick={save}>Save offline</Action></div>
            </div></div>
            <div className="grid grid-cols-1 gap-3 border-t border-ink-100 pt-4 sm:grid-cols-3">
                {lesson.summary.map(({ label, value, hint }) =>
                    <div key={label} className="rounded-xl bg-ink-50/70 p-3.5"><p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
                        <p className="mt-1 text-[15px] font-semibold text-ink-900">{value}</p><p className="mt-0.5 text-[11.5px] text-ink-500">{hint}</p></div>)}
            </div>
        </div>
    </Card>;
}

export function Courses({ courses, subtitle }: { courses: readonly StudentCourse[]; subtitle: string }) {
    return <Card className="overview-actions-wide" title="My courses" subtitle={subtitle} actions={<Go to="student/courses" icon="external">All courses</Go>}>
        <Table columns={['Course', 'Progress', 'Lessons', '']} rows={courses.map(c => [
            <RecordName title={c.title} code={c.code}/>, <div className="w-32 space-y-1.5">
                <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-ink-700 tnum">{c.value}%</span></div>
                <div className="prog-track"><div className="prog-fill bg-brand-500" style={{ width: `${c.value}%` }}/></div></div>,
            <Badge tone="slate">{c.lessons}</Badge>, <div className="flex justify-end"><Go to="student/course">Continue</Go></div>,
        ])}/>
    </Card>;
}

export function Pending({ pending }: { pending: readonly PendingWork[] }) {
    return <Card className="overview-actions" title="Pending assignments" subtitle="Work that is outstanding across your courses" actions={<Badge tone="amber">{pending.length} outstanding</Badge>}>
        <Table columns={['Assignment', 'Due', 'Status', '']} rows={pending.map(a => [
            <div className="min-w-0"><p className="truncate font-medium text-ink-800">{a.title}</p>
                <p className="truncate text-[11px] text-ink-400">{a.course}</p></div>, <span className="text-[13px] text-ink-600">{a.due}</span>,
            <Badge tone={a.tone}>{a.state}</Badge>, <div className="flex justify-end"><Go to="student/assignments">Open</Go></div>,
        ])}/>
    </Card>;
}

export function Results({ studentResults }: { studentResults: readonly Result[] }) {
    return <Card title="Released results" subtitle="Scores released to you by the examination officer" actions={<Go to="student/results" icon="external">All results</Go>}>
        <Table columns={['Code', 'Course', 'CA', 'Mid', 'Total', 'Grade']} rows={studentResults.map(r => [
            <span className="font-mono text-[12px] font-medium text-ink-700">{r.course}</span>, <span className="font-medium text-ink-800">{r.title}</span>,
            <span className="text-[13px] tnum">{r.ca}</span>, <span className="text-[13px] tnum">{r.mid}</span>,
            <span className="text-[13px] font-semibold tnum">{r.total}</span>, <Badge tone={r.state === 'released' ? 'emerald' : 'amber'}>{r.grade}</Badge>,
        ])}/>
    </Card>;
}

export function Notices({ notifications }: { notifications: readonly Notice[] }) {
    return <Card title="Notices for you" subtitle="Published to the whole cohort">
        <ul className="divide-y divide-ink-100">{notifications.map(n => <li key={n.id} className="py-3">
            <p className="text-[13px] font-medium text-ink-800">{n.title}</p><p className="mt-0.5 text-xs text-ink-500">{n.meta}</p>
            <p className="mt-1 text-[11px] text-ink-400">{n.time}</p></li>)}</ul>
    </Card>;
}
