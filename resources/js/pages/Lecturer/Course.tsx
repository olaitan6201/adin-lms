import { teachingCourse, health, chapterOutline } from '@/data/learning/teaching';
import { TeachingOverview } from '@/components/learning/TeachingOverview';
import { workspaceUrl } from '@/lib/workspaceUrl';
import { ContentPanel, ResourcesPanel } from '@/components/learning/TeachingPanels';
import { AssignmentsPanel, GradebookPanel } from '@/components/learning/TeachingAssessment';
import { courseModules, resources, assignments } from '@/data/learning/courseWorkspace';
import { gradeRows } from '@/data/assessments/gradebook';
import { Tabs } from '@/components/ui/navigation/Tabs';
import { Action } from '@/components/ui/controls/Action';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { Note } from '@/components/learning/Parts';

function ModuleLink({ title, description, href, action }: { title: string; description: string; href: string; action: string }) {
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
    const items = [
        { id: 'overview', label: 'Overview', content: <TeachingOverview health={health} /> },
        {
            id: 'content',
            label: 'Content',
            count: teachingCourse.modules,
            content: <ContentPanel courseModules={courseModules} outline={chapterOutline} />,
        },
        { id: 'resources', label: 'Resources', count: teachingCourse.resources, content: <ResourcesPanel resources={resources} /> },
        {
            id: 'assignments',
            label: 'Assignments',
            count: teachingCourse.assignments,
            content: <AssignmentsPanel assignments={assignments} />,
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
                        <Action icon="eye" variant="outline">
                            Preview as student
                        </Action>
                        <Action icon="plus" variant="primary">
                            Add content
                        </Action>
                    </>
                }
            />

            <div className="learning-tabs space-y-5">
                <Tabs
                    label="Course workspace"
                    items={items.map((item) => ({ ...item, content: <div className="mt-5 space-y-5">{item.content}</div> }))}
                />

                <Note tone="sky">
                    Students see only what is published for their course. Draft modules, unpublished assignments and unreleased scores stay
                    invisible to them.
                </Note>
            </div>
        </div>
    );
}
