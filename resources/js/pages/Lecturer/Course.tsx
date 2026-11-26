import { TeachingOverview } from '@/components/learning/TeachingOverview';
import { workspaceUrl } from '@/lib/workspaceUrl';

import { ContentPanel, ResourcesPanel } from '@/components/learning/TeachingPanels';
import { AssignmentsPanel, GradebookPanel } from '@/components/learning/TeachingAssessment';
import { course } from '@/components/learning/TeachingPanels';
import { Tabs } from '@/components/workspace/Panels';
import { Action, PageHeader } from '@/components/workspace/Elements';
import { Note } from '@/components/learning/Parts';

export default function Course() {
    const panels: Record<string, React.ReactNode> = {
        overview: <TeachingOverview />,
        content: <ContentPanel />,
        resources: <ResourcesPanel />,
        assignments: <AssignmentsPanel />,
        gradebook: <GradebookPanel />,
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
                eyebrow="ACC302 · 2025/2026 first semester"
                title="Intermediate Financial Accounting"
                description={`Blended delivery · 68 students · ${course.mode} · 5 of 7 modules published`}
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
                        { id: 'content', label: 'Content', count: 7 },
                        { id: 'resources', label: 'Resources', count: 7 },
                        { id: 'assignments', label: 'Assignments', count: 2 },
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
