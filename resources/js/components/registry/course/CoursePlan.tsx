import { Records, Progress, status, cap } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import { workspaceUrl } from '@/lib/workspaceUrl';
import type { Overview } from '@/types/registry/course';

export function CoursePlan({
    courseModules,
    gradeWeights,
    overview,
}: {
    courseModules: {
        week: string;
        title: string;
        items: number;
        state: string;
        completion: number;
    }[];
    gradeWeights: {
        item: string;
        source: string;
        weight: number;
        policy: string;
    }[];
    overview: Overview;
}) {
    return (
        <>
            {' '}
            <Records
                title="Learning outcomes and programme mapping"
                subtitle="CCMAS mapping checked at approval and re-checked by quality assurance"
                actions={
                    <Action
                        size="sm"
                        variant="primary"
                        icon="target"
                        href={workspaceUrl('admin/qa')}
                    >
                        Report approved structure for QA
                    </Action>
                }
                columns={['Ref', 'Course learning outcome', 'Programme outcomes']}
                rows={overview.outcomes.map((o) => [
                    <code key="code" className="font-mono text-[11.5px] text-ink-500">
                        {o.code}
                    </code>,
                    <span key="outcome" className="text-[13px] text-ink-700">
                        {o.text}
                    </span>,
                    <code key="mapping" className="font-mono text-[11.5px] text-brand-700">
                        {o.mapped}
                    </code>,
                ])}
            />
            <Records
                title="Course structure"
                subtitle="The weekly sequence published to students"
                actions={
                    <Action size="sm" icon="document" href={workspaceUrl('admin/content')}>
                        Open content library
                    </Action>
                }
                columns={['Week', 'Topic', 'Items', 'Completion', 'State']}
                rows={courseModules.map((m) => [
                    <span key="week" className="text-[12.5px] font-medium text-ink-700">
                        {m.week}
                    </span>,
                    <span key="module" className="text-[13px] text-ink-800">
                        {m.title}
                    </span>,
                    <span key="items" className="text-[12.5px] text-ink-500">
                        {m.items} items
                    </span>,
                    <Progress key="completion" stacked n={m.completion} />,
                    status(cap(m.state), m.state === 'draft' ? 'slate' : 'emerald'),
                ])}
            />
            <Records
                title="Assessment plan"
                subtitle="An example policy, not a mandated default"
                actions={status(`Total ${gradeWeights.reduce((total, w) => total + w.weight, 0)}%`, 'emerald')}
                columns={['Component', 'Source', 'Weight', 'Policy']}
                rows={gradeWeights.map((w) => [
                    <span key="item" className="text-[13px] font-medium text-ink-800">
                        {w.item}
                    </span>,
                    <span key="source" className="text-[13px] text-ink-600">
                        {w.source}
                    </span>,
                    <span key="weight" className="tnum text-[13px] font-semibold text-ink-900">
                        {w.weight}%
                    </span>,
                    <span key="policy" className="text-[12.5px] text-ink-500">
                        {w.policy}
                    </span>,
                ])}
            />
        </>
    );
}
