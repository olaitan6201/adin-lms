import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Tabs } from 'radix-ui';
import { Card } from '@/components/workspace/Elements';

export type WorkspaceRole = 'admin' | 'lecturer' | 'student' | 'guardian';
export type TeachingRole = Exclude<WorkspaceRole, 'guardian'>;

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

export function Drawer({ title, subtitle, children, close }: { title: string; subtitle?: string; children: ReactNode; close: () => void }) {
    const ref = useRef<HTMLDialogElement>(null);
    const heading = useId();
    useEffect(() => {
        const dialog = ref.current;
        dialog?.showModal();
        return () => dialog?.close();
    }, []);
    return <dialog ref={ref} aria-labelledby={heading} onCancel={close} className="fixed inset-y-0 right-0 left-auto m-0 ml-auto h-dvh max-h-dvh w-full max-w-md overflow-y-auto bg-white p-0 shadow-xl backdrop:bg-ink-900/45">
        <header className="flex items-start justify-between gap-3 border-b p-5">
            <div><h2 id={heading} className="font-semibold">{title}</h2>{subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}</div>
            <button type="button" className="btn btn-ghost btn-sm" aria-label="Close panel" onClick={close}><X size={18}/></button>
        </header>
        <div className="space-y-4 p-5 text-sm">{children}</div>
    </dialog>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
    return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>;
}

export function Note({ children }: { children: ReactNode }) {
    return <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">{children}</p>;
}

export function download(name: string, content: string, type: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.download = name;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
