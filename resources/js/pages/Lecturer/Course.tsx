import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { SelectedCourseSummary } from '@/components/learning/SelectedCourseSummary';
import { useCourseDrafts } from '@/components/learning/useCourseDrafts';
import { teachingCourse, health, chapterOutline } from '@/data/learning/teaching';
import { TeachingOverview } from '@/components/learning/TeachingOverview';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { ContentPanel, ResourcesPanel } from '@/components/learning/TeachingPanels';
import { AssignmentsPanel, GradebookPanel } from '@/components/learning/TeachingAssessment';
import { courseModules, resources, assignments, offerings } from '@/data/learning/courseWorkspace';
import { gradeRows } from '@/data/assessments/gradebook';
import { Tabs } from '@/components/ui/navigation/Tabs';
import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Note } from '@/components/learning/Parts';

function ModuleLink({ title, description, href, action }: {
    title: string;
    description: string;
    href: string;
    action: string
}) {
    return (
        <div className="rounded-xl border border-ink-100 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-ink-800">{title}</p>
            <p className="mt-1 text-[13px] text-ink-500">{description}</p>
            <Action href={href} variant="outline">
                {action}
            </Action>
        </div>
    );
}

export default function Course() {
    const code = new URL(usePage().url, 'http://workspace.local').searchParams.get('course') ?? 'ACC302';
    const course = offerings.slice(0, 4).find((item) => item.code === code);
    const scoped = assignments.filter((item) => item.course === course?.code);
    if (!course || course.code !== 'ACC302') {
        return (
            <SelectedCourseSummary
                course={course}
                back={workspaceUrl('lecturer/courses')}
                description={`${course?.mode} · ${course?.students} students · ${course?.term}`}
            >
                {course && <AssignmentsPanel assignments={scoped} />}
            </SelectedCourseSummary>
        );
    }

    return <AccountingWorkspace />;
}

function AccountingWorkspace() {
    const [tab, selectTab] = useState('overview');
    const [settings, setSettings] = useState<Record<string, string>>({});
    const { drafts, edit } = useCourseDrafts();
    const scoped = assignments.filter((item) => item.course === 'ACC302');
    const items = [
        {
            id: 'overview',
            label: 'Overview',
            content: (
                <TeachingOverview
                    health={health}
                    select={selectTab}
                    settings={settings}
                    change={(key, value) => setSettings((current) => ({ ...current, [key]: value }))}
                />
            ),
        },
        {
            id: 'content',
            label: 'Content',
            count: teachingCourse.modules,
            content: <ContentPanel courseModules={courseModules} outline={chapterOutline} edit={edit} />,
        },
        { id: 'resources', label: 'Resources', count: resources.length, content: <ResourcesPanel resources={resources} upload={() => edit('Resource')} /> },
        {
            id: 'assignments',
            label: 'Assignments',
            count: scoped.length,
            content: <AssignmentsPanel assignments={scoped} />,
        },
        { id: 'gradebook', label: 'Gradebook', content: <GradebookPanel gradeRows={gradeRows.slice(0, 5)} /> },
        {
            id: 'attendance',
            label: 'Attendance',
            content: (
                <ModuleLink
                    title="Attendance for this course"
                    description="The register for each scheduled class is managed from the Attendance module."
                    href={workspaceUrl('lecturer/attendance')}
                    action="Open attendance"
                />
            ),
        },
        {
            id: 'discussions',
            label: 'Discussions',
            content: (
                <ModuleLink
                    title="Course forum"
                    description="Threads, announcements and messages for this course live in the Communication module."
                    href={workspaceUrl('lecturer/communication')}
                    action="Open communication"
                />
            ),
        },
    ];

    return (
        <div className="learning-surface">
            <PageHeader
                eyebrow={teachingCourse.term}
                title={teachingCourse.title}
                description={teachingCourse.summary}
                actions={
                    <>
                        <Action href={workspaceUrl('student/course?course=ACC302')}>
                            Preview as student
                        </Action>
                        <Action variant="primary" onClick={() => edit('Module')}>
                            Add content
                        </Action>
                    </>
                }
            />

            <div className="learning-tabs space-y-5">
                <Tabs
                    label="Course workspace"
                    active={tab}
                    onChange={selectTab}
                    items={items.map((item) => ({ ...item, content: <div className="mt-5 space-y-5">{item.content}</div> }))}
                />

                {drafts.length > 0 && (
                    <section className="card card-pad">
                        <h2>Unpublished drafts for this visit</h2>
                        {drafts.map((draft) => (
                            <details key={draft.id}>
                                <summary>{draft.kind}: {draft.title}</summary>
                                <p className="whitespace-pre-line">{draft.detail}</p>
                            </details>
                        ))}
                    </section>
                )}
                <Note tone="sky">
                    Students see only what is published for their course. Draft modules, unpublished assignments and unreleased scores stay
                    invisible to them.
                </Note>
            </div>
        </div>
    );
}
