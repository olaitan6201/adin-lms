import type { ReactNode } from 'react';
import { Tabs } from 'radix-ui';
import { Card } from '@/components/ui/layout/Card';
import { PageHeader } from '@/components/ui/layout/PageHeader';
import { download } from '@/lib/download';
export { Field } from './RegistryField';

export { useDesk, type Desk, type Panel } from './DeskPanel';
export type Tab = [string, number?];

interface RegisterProps {
    eyebrow: string;
    title: string;
    description: string;
    actions: ReactNode;
    tabs?: Tab[];
    active?: number;
    select?: (index: number) => void;
    children: ReactNode;
    overlay: ReactNode;
}

type RegisterTabsProps = {
    tabs: Tab[];
    title: string;
};

function RegisterTabs({ tabs, title }: RegisterTabsProps) {
    return (
        <Card bodyClassName="p-0">
            <div data-scroll className="overflow-x-auto border-b border-ink-100">
                <Tabs.List aria-label={`${title} sections`} className="flex min-w-max gap-1">
                    {tabs.map(([label, count], index) => (
                        <Tabs.Trigger
                            key={label}
                            value={String(index)}
                            className="whitespace-nowrap border-b-2 border-transparent px-3.5 py-2.5 text-sm font-medium text-ink-500 data-[state=active]:border-brand-600 data-[state=active]:text-brand-800"
                        >
                            {label}
                            {count !== undefined && (
                                <span className="tnum ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[11px] leading-5 font-semibold text-ink-600">
                                    {count}
                                </span>
                            )}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>
            </div>
        </Card>
    );
}

export function Register({
    eyebrow,
    title,
    description,
    actions,
    tabs,
    active,
    select,
    children,
    overlay,
}: RegisterProps) {
    return (
        <>
            <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
            <div className="min-w-0 space-y-5">
                {tabs ? (
                    <Tabs.Root
                        value={String(active)}
                        onValueChange={(value) => select?.(Number(value))}
                        className="space-y-5"
                    >
                        <RegisterTabs tabs={tabs} title={title} />
                        <Tabs.Content value={String(active)} className="space-y-5">
                            {children}
                        </Tabs.Content>
                    </Tabs.Root>
                ) : (
                    children
                )}
            </div>
            {overlay}
        </>
    );
}

export function exportRecords(name: string, records: object[]) {
    download(`${name}.json`, JSON.stringify(records, null, 2), 'application/json');
}
