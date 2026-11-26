import type { DraftKind, CourseDraft } from './CourseDraftForm';
import type { TeachingResources, TeachingModules } from '@/types/learning/study';
import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { Badge } from '@/components/ui/data-display/Badge';
import { Card } from '@/components/ui/layout/Card';
import { Action } from '@/components/ui/controls/Action';
import { Table } from '@/components/ui/data-display/Table';
import { StudyIcon } from '@/components/learning/Parts';

export function ContentPanel({ courseModules, outline, edit }: {
    courseModules: TeachingModules;
    outline: string[];
    edit: (kind: DraftKind, initial?: CourseDraft, id?: string) => void;
}) {
    const rows = courseModules.map((module) => [
        <span key="week" className="font-mono text-[11.5px] font-medium text-ink-500">
            {module.week}
        </span>,
        <span key="module" className="font-medium text-ink-800">
            {module.title}
        </span>,
        <span key="items" className="text-[13px] tnum">
            {module.items}
        </span>,
        <div key="progress" className="w-28">
            <div className="flex items-center gap-2">
                <div className="prog-track">
                    <div className="prog-fill" style={{ width: `${module.completion}%` }} />
                </div>
                <span className="text-[11px] font-medium text-ink-600 tnum">{module.completion}%</span>
            </div>
        </div>,
        <Badge key="state" tone={module.state === 'published' ? 'emerald' : 'amber'}>
            {module.state === 'published' ? 'Published' : 'Draft'}
        </Badge>,
        <div key="actions" className="flex justify-end gap-1.5">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => edit('Module', { title: module.title, detail: module.week }, module.id)}>
                Edit
            </button>
        </div>,
    ]);

    return (
        <>
            <Card
                className="[&_th:last-child]:w-[90px] [&_th:first-child]:w-[70px]"
                title="Weekly modules"
                subtitle="Content structure and learner progress per module"
                actions={
                    <>
                        <Action size="sm" onClick={() => edit('Module')}>
                            Add module
                        </Action>
                        <Action size="sm" onClick={() => edit('Chapter')}>
                            Write chapter
                        </Action>
                    </>
                }
            >
                <Table
                    columns={['Week', 'Module', 'Items', 'Progress', 'State', '']}
                    rows={rows}
                    rowKeys={courseModules.map((module) => module.id)}
                />
            </Card>
            <Card title="Chapter manuscript structure" subtitle="What a complete chapter carries">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {outline.map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-2 rounded-lg border border-ink-100 px-3 py-2.5"
                        >
                            <span className="text-brand-600">
                                <StudyIcon name="check" className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[13px] text-ink-700">{item}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );
}

export function ResourcesPanel({ resources, upload }: { resources: TeachingResources; upload: () => void }) {
    const { openDrawer } = useWorkspaceOverlays();
    function showResource(resource: TeachingResources[number]) {
        openDrawer({
            title: resource.name,
            description: `${resource.type} · ${resource.size} · ${resource.version}`,
            content: <p>{resource.access}. Updated {resource.updated}. This catalogue record is read-only.</p>,
        });
    }

    const rows = resources.map((resource) => [
        <div key="resource" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
                <StudyIcon name={resource.icon} className="w-4 h-4" />
            </span>
            <div className="min-w-0">
                <p className="truncate font-medium text-ink-800">{resource.name}</p>
                <p className="truncate text-[11px] text-ink-400">
                    {resource.type} · {resource.size}
                </p>
            </div>
        </div>,
        <Badge key="version" tone="slate">
            {resource.version}
        </Badge>,
        <Badge key="access" tone={resource.access === 'Open' ? 'emerald' : 'amber'}>
            {resource.access}
        </Badge>,
        <span key="updated" className="text-[12.5px] text-ink-500">
            {resource.updated}
        </span>,
        <div key="actions" className="flex justify-end gap-1.5">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => showResource(resource)}>
                Details
            </button>
        </div>,
    ]);

    return (
        <Card
            className="[&_th:last-child]:w-[110px]"
            title="Resources"
            subtitle="Files, links and embeds attached to this course"
            actions={
                <Action size="sm" onClick={upload}>
                    Upload resource
                </Action>
            }
        >
            <Table columns={['Resource', 'Version', 'Access', 'Updated', '']} rows={rows} />
        </Card>
    );
}
