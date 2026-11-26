import type { ReactElement, ReactNode } from 'react';
import { Tabs as TabPrimitive } from 'radix-ui';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type TabItem = { id: string; label: ReactNode; count?: number; content: ReactNode };

type TabsProps = {
    label: string;
    items: TabItem[];
    active?: string;
    defaultActive?: string;
    onChange?: (id: string) => void;
};

export function Tabs({ label, items, active, defaultActive, onChange }: TabsProps) {
    return (
        <TabPrimitive.Root value={active} defaultValue={defaultActive ?? items[0]?.id} onValueChange={onChange}>
            <div className="overflow-x-auto border-b border-ink-100" data-scroll>
                <TabPrimitive.List aria-label={label} className="flex min-w-max gap-1">
                    {items.map(({ id, label: tabLabel, count }) => (
                        <TabPrimitive.Trigger key={id} value={id}
                            className="whitespace-nowrap border-b-2 border-transparent px-3.5 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-800 focus-visible:ring-inset data-[state=active]:border-brand-600 data-[state=active]:text-brand-800">
                            {tabLabel}
                            {count != null && <span className="tnum ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[11px] font-semibold text-ink-600">{count}</span>}
                        </TabPrimitive.Trigger>
                    ))}
                </TabPrimitive.List>
            </div>
            {items.map(({ id, content }) => <TabPrimitive.Content key={id} value={id}>{content}</TabPrimitive.Content>)}
        </TabPrimitive.Root>
    );
}

type DrawerProps = {
    title: string;
    description?: string;
    trigger?: ReactElement;
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export function Drawer({ title, description, trigger, open, onOpenChange, children }: DrawerProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent className="w-full gap-0 bg-white sm:max-w-lg" {...(!description && { 'aria-describedby': undefined })}>
                <SheetHeader className="border-b border-ink-100 p-5 pr-12">
                    <SheetTitle>{title}</SheetTitle>
                    {description && <SheetDescription>{description}</SheetDescription>}
                </SheetHeader>
                <div className="min-h-0 overflow-y-auto p-5" data-scroll>{children}</div>
            </SheetContent>
        </Sheet>
    );
}
