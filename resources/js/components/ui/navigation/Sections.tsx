import type { ReactNode } from 'react';
import { Tabs } from 'radix-ui';
import { Card } from '@/components/ui/layout/Card';

export function Sections({ names, active, change, panels, messageCount }: {
    names: string[]; active: string; change: (name: string) => void; panels: ReactNode[]; messageCount?: number;
}) {
    return <Tabs.Root value={active} onValueChange={change} className="space-y-5"><Card bodyClassName="p-0">
        <Tabs.List aria-label="Sections" className="flex overflow-x-auto">
            {names.map(name => <Tabs.Trigger key={name} value={name} className="shrink-0 border-b-2 border-transparent px-3.5 py-2.5 text-sm font-medium text-ink-500 hover:text-ink-800 data-[state=active]:border-brand-600 data-[state=active]:text-brand-800">
                {name}{name === 'Messages' && <span className="ml-1.5 rounded-full bg-ink-100 px-1.5 text-xs">{messageCount}</span>}
            </Tabs.Trigger>)}
        </Tabs.List></Card>
        {names.map((name,i) => <Tabs.Content forceMount value={name} key={name} hidden={active !== name} className="space-y-5">{panels[i]}</Tabs.Content>)}
    </Tabs.Root>;
}
