import { useState } from 'react';
import { type Desk } from '@/components/registry/Desk';
import { Records, Progress, status, cap, val } from '@/components/registry/Records';
import { Action } from '@/components/ui/controls/Action';
import type { LibraryModule, ContentSummary } from '@/types/registry/content';
import { ModuleFields } from './ModuleFields';

export function WeeklyModules({
    initialModules,
    contentSummary,
    contents,
    desk,
    visible,
}: {
    initialModules: LibraryModule[];
    contentSummary: ContentSummary;
    contents: string[];
    desk: Desk;
    visible: boolean;
}) {
    const [modules, setModules] = useState(initialModules);

    function moduleForm(module?: LibraryModule) {
        desk.show({
            title: module
                ? `${module.week} · ${module.id === contentSummary.manuscriptModule ? contentSummary.manuscriptTitle : module.title}`
                : 'Add module',
            subtitle: module && `${module.items} learning items · ${module.state}`,
            submit: 'Save module',
            message: 'Module saved',
            body: <ModuleFields module={module} contentSummary={contentSummary} contents={contents} />,
            save: (data) => {
                const edit = {
                    title: val(data, 'Topic title'),
                    objectives: val(data, 'Objectives'),
                    time: val(data, 'Estimated study time'),
                };
                setModules((records) =>
                    module
                        ? records.map((record) => (record.id === module.id ? { ...record, ...edit } : record))
                        : [
                              ...records,
                              {
                                  ...edit,
                                  id: crypto.randomUUID(),
                                  week: `Week ${records.length + 1}`,
                                  state: 'draft',
                                  completion: 0,
                                  items: 0,
                              },
                          ],
                );
            },
        });
    }

    if (!visible) return null;

    return (
        <Records
            tableClass="[&_th:last-child]:w-[90px] [&_td:last-child]:text-right [&_th:first-child]:w-20"
            title="Weekly modules"
            subtitle={`${contentSummary.code} · ${modules.length} modules · ${contentSummary.items} learning items`}
            actions={
                <>
                    <Action size="sm" icon="plus" onClick={() => moduleForm()}>
                        Add module
                    </Action>
                    <Action
                        size="sm"
                        icon="document"
                        variant="primary"
                        onClick={() =>
                            moduleForm(modules.find((module) => module.id === contentSummary.manuscriptModule))
                        }
                    >
                        Chapter manuscript
                    </Action>
                </>
            }
            columns={['Week', 'Module', 'Items', 'Learner progress', 'State', '']}
            rows={modules.map((module) => [
                <span key="week" className="font-mono text-[11.5px] font-medium text-ink-500">
                    {module.week}
                </span>,
                <span key="module" className="font-medium text-ink-800">
                    {module.title}
                </span>,
                <span key="items" className="tnum text-[13px]">
                    {module.items}
                </span>,
                <span key="progress" className="tnum">
                    <Progress n={module.completion} />
                </span>,
                status(cap(module.state)),
                <Action key="edit" size="sm" onClick={() => moduleForm(module)}>
                    Edit
                </Action>,
            ])}
        />
    );
}
