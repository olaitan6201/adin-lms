import { workspaceUrl } from '@/lib/workspaceUrl';
import { studentModules } from '@/components/learning/fixtures';
import { Badge, Card, Action, PageHeader } from '@/components/workspace/Elements';
import { Meter, Note, StudyIcon } from '@/components/learning/Parts';

export default function Courses() {
    const courses = [
        {
            code: 'ACC302',
            title: 'Intermediate Financial Accounting',
            lecturer: 'Dr. Peter Adeyemi',
            value: 46,
            lessons: '3 / 12',
            mode: 'Blended',
            next: 'Practice set 3.1',
        },
        {
            code: 'BSC205',
            title: 'Cell and Molecular Biology',
            lecturer: 'Dr. Amaka Eze',
            value: 61,
            lessons: '5 / 9',
            mode: 'Online',
            next: 'Lab report submission',
        },
        {
            code: 'ENG210',
            title: 'Literary Devices and Criticism',
            lecturer: 'Dr. Halima Yusuf',
            value: 38,
            lessons: '2 / 11',
            mode: 'Face-to-face',
            next: 'Group presentation prep',
        },
        {
            code: 'MTH112',
            title: 'Calculus I',
            lecturer: 'Dr. Uche Okonkwo',
            value: 54,
            lessons: '6 / 12',
            mode: 'Online',
            next: 'Revision quiz 3',
        },
    ];

    const cards = courses.map((course) => (
        <article key={course.code} className="card card-pad flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-mono text-[11.5px] font-medium text-ink-400">{course.code}</p>
                    <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-ink-900">{course.title}</h3>
                    <p className="mt-1 text-[12.5px] text-ink-500">
                        {course.lecturer} · {course.mode}
                    </p>
                </div>
                <Badge tone="slate">{course.mode}</Badge>
            </div>
            <Meter value={course.value} label={`${course.lessons} lessons completed`} showValue={true} />
            <div className="flex items-center justify-between gap-3 border-t border-ink-100 pt-3">
                <span className="flex min-w-0 items-center gap-2 text-[12.5px] text-ink-500">
                    <StudyIcon name="target" className="w-4 h-4 shrink-0 text-brand-600" />
                    <span className="truncate">Next: {course.next}</span>
                </span>
                <Action href={workspaceUrl('student/course')} variant="primary" size="sm">
                    Continue
                </Action>
            </div>
        </article>
    ));

    return (
        <>
            <PageHeader
                eyebrow="Learning"
                title="My courses"
                description="Four registered courses for the 2025/2026 first semester, 12 units in total."
                actions={
                    <>
                        <Action href={workspaceUrl('student/downloads')} icon="download" variant="outline">
                            Downloads
                        </Action>
                        <Action href={workspaceUrl('student/calendar')} icon="calendar" variant="outline">
                            Timetable
                        </Action>
                    </>
                }
            />

            <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{cards}</div>

                <Card title="Lesson checklist" subtitle="ACC302 · what is still to be done in this course">
                    <ul className="divide-y divide-ink-100">
                        {studentModules.map((module) => {
                            const tone =
                                module.state === 'complete'
                                    ? 'emerald'
                                    : module.state === 'in progress'
                                      ? 'sky'
                                      : module.state === 'locked'
                                        ? 'slate'
                                        : 'amber';
                            const label =
                                module.state === 'complete'
                                    ? 'Done'
                                    : module.state === 'in progress'
                                      ? 'In progress'
                                      : module.state === 'locked'
                                        ? 'Opens 18 Nov'
                                        : 'Available';
                            return (
                                <li key={module.title} className="flex items-center gap-3 py-2.5">
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                                            {module.week}
                                        </span>
                                        <span className="mt-0.5 block truncate text-[13px] text-ink-700">{module.title}</span>
                                    </span>
                                    <span className="hidden text-[12px] text-ink-400 sm:block">{module.duration}</span>
                                    <Badge tone={tone}>{label}</Badge>
                                </li>
                            );
                        })}
                    </ul>
                </Card>

                <Note tone="sky">
                    A lesson opens when the lecturer publishes it. Saving a lesson for offline use keeps it on your device until you remove it.
                </Note>
            </div>
        </>
    );
}
