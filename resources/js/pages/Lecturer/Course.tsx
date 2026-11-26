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

export default function Course() {
    const panels: Record<string, React.ReactNode> = {
        overview: <TeachingOverview health={health} />,
        content: <ContentPanel courseModules={courseModules} outline={chapterOutline} />,
        resources: <ResourcesPanel resources={resources} />,
        assignments: <AssignmentsPanel assignments={assignments} />,
        gradebook: <GradebookPanel gradeRows={gradeRows.slice(0, 5)} />,
        attendance: (
            <div className="rounded-xl border border-ink-100 bg-white p-8 text-center">
                <p className="text-sm font-semibold text-ink-800">Attendance for this course</p>
                <p className="mt-1 text-[13px] text-ink-500">The register for each scheduled class is managed from the Attendance module.</p>
                <Action href={workspaceUrl('lecturer/attendance')} variant="outline">
                    Open attendance
                </Action>
            </div>
        ),
        discussions: (
            <div className="rounded-xl border border-ink-100 bg-white p-8 text-center">
                <p className="text-sm font-semibold text-ink-800">Course forum</p>
                <p className="mt-1 text-[13px] text-ink-500">
                    Threads, announcements and messages for this course live in the Communication module.
                </p>
                <Action href={workspaceUrl('lecturer/communication')} variant="outline">
                    Open communication
                </Action>
            </div>
        ),
    };

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
                    items={[
                        { id: 'overview', label: 'Overview' },
                        { id: 'content', label: 'Content', count: teachingCourse.modules },
                        { id: 'resources', label: 'Resources', count: teachingCourse.resources },
                        { id: 'assignments', label: 'Assignments', count: teachingCourse.assignments },
                        { id: 'gradebook', label: 'Gradebook' },
                        { id: 'attendance', label: 'Attendance' },
                        { id: 'discussions', label: 'Discussions' },
                    ].map((item) => ({ ...item, content: <div className="mt-5 space-y-5">{panels[item.id]}</div> }))}
                />

                <Note tone="sky">
                    Students see only what is published for their course. Draft modules, unpublished assignments and unreleased scores stay
                    invisible to them.
                </Note>
            </div>
        </div>
    );
}
