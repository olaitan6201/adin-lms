import { TeachingOverview } from '@/components/study-workspace/TeachingOverview';
import { workspaceUrl } from '@/lib/workspaceUrl';

import { ContentPanel, ResourcesPanel } from '@/components/study-workspace/TeachingPanels';
import { AssignmentsPanel, GradebookPanel } from '@/components/study-workspace/TeachingAssessment';
import { course } from '@/components/study-workspace/TeachingPanels';
import { Tabs } from '@/components/workspace/Panels';
import { Action, PageHeader } from '@/components/workspace/Elements';
import { Note } from '@/components/study-workspace/Parts';

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
        <>
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

            <div className="space-y-5 [&_[role=tablist]]:rounded-xl [&_[role=tablist]]:bg-white [&_[role=tablist]]:shadow-soft">
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
        </>
    );
}
