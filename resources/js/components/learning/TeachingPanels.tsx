import { useWorkspaceOverlays } from '@/layouts/workspace/WorkspaceOverlays';
import { courseModules, offerings, resources } from '@/components/learning/fixtures';
import { Badge, Card, Action, Table } from '@/components/workspace/Elements';
import { StudyIcon } from '@/components/learning/Parts';

export { course };
const course = offerings[0];
export function ContentPanel() {
    const { notify } = useWorkspaceOverlays();
    const rows = courseModules.map((module) => [
        <span className="font-mono text-[11.5px] font-medium text-ink-500">{module.week}</span>,
        <span className="font-medium text-ink-800">{module.title}</span>,
        <span className="text-[13px] tnum">{module.items}</span>,
        <div className="w-28">
            <div className="flex items-center gap-2">
                <div className="prog-track">
                    <div className="prog-fill" style={{ width: `${module.completion}%` }} />
                </div>
                <span className="text-[11px] font-medium text-ink-600 tnum">{module.completion}%</span>
            </div>
        </div>,
        <Badge tone={module.state === 'published' ? 'emerald' : 'amber'}>{module.state === 'published' ? 'Published' : 'Draft'}</Badge>,
        <div className="flex justify-end gap-1.5">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => notify('Module editor opened')}>
                Edit
            </button>
        </div>,
    ]);

    return (
        <>
            <Card
                title="Weekly modules"
                subtitle="Content structure and learner progress per module"
                actions={
                    <>
                        <Action icon="plus" variant="outline" size="sm">
                            Add module
                        </Action>
                        <Action icon="document" variant="primary" size="sm">
                            Write chapter
                        </Action>
                    </>
                }
            >
                <Table columns={['Week', 'Module', 'Items', 'Progress', 'State', '']} rows={rows} />
            </Card>
            <Card title="Chapter manuscript structure" subtitle="What a complete chapter carries">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        'Objectives',
                        'Explanation',
                        'Illustrations',
                        'Worked examples',
                        'Practical examples',
                        'Exercises',
                        'Revision questions',
                        'Activities and quizzes',
                        'Summary',
                        'References and reading list',
                    ].map((item) => (
                        <div key={item} className="flex items-center gap-2 rounded-lg border border-ink-100 px-3 py-2.5">
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
export function ResourcesPanel() {
    const { notify } = useWorkspaceOverlays();
    const rows = resources.map((resource) => [
        <div className="flex items-center gap-2.5">
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
        <Badge tone="slate">{resource.version}</Badge>,
        <Badge tone={resource.access === 'Open' ? 'emerald' : 'amber'}>{resource.access}</Badge>,
        <span className="text-[12.5px] text-ink-500">{resource.updated}</span>,
        <div className="flex justify-end gap-1.5">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => notify('Resource options opened')}>
                Manage
            </button>
        </div>,
    ]);

    return (
        <Card
            title="Resources"
            subtitle="Files, links and embeds attached to this course"
            actions={
                <Action icon="upload" variant="primary" size="sm">
                    Upload resource
                </Action>
            }
        >
            <Table columns={['Resource', 'Version', 'Access', 'Updated', '']} rows={rows} />
        </Card>
    );
}
