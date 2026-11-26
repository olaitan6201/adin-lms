import type { ReactNode } from 'react';
import { Tabs } from 'radix-ui';
import { Card } from '@/components/ui/layout/Card';

export type SectionItem<Id extends string> = { id: Id; label: string; count?: number; panel: ReactNode };

export function Sections<Id extends string>({ items, active, change }: {
    items: SectionItem<Id>[]; active: Id; change: (id: Id) => void;
}) {
    function select(value: string) {
        const item = items.find(item => item.id === value);
        if (item) change(item.id);
    }

    return <Tabs.Root value={active} onValueChange={select} className="space-y-5"><Card bodyClassName="p-0">
        <Tabs.List aria-label="Sections" className="flex gap-1 overflow-x-auto border-b border-ink-100">
            {items.map(({ id, label, count }) => <Tabs.Trigger key={id} value={id} className="shrink-0 border-b-2 border-transparent px-3.5 py-2.5 text-sm font-medium text-ink-500 hover:text-ink-800 data-[state=active]:border-brand-600 data-[state=active]:text-brand-800">
                {label}{count !== undefined && <span className="ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[11px] leading-5 font-semibold tnum">{count}</span>}
            </Tabs.Trigger>)}
        </Tabs.List></Card>
        {items.map(({ id, panel }) => <Tabs.Content forceMount value={id} key={id} hidden={active !== id} className="space-y-5">{panel}</Tabs.Content>)}
    </Tabs.Root>;
}
