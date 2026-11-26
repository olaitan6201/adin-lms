import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Tabs } from 'radix-ui';
import { Action } from '@/components/ui/controls/Action';
import { Card } from '@/components/ui/layout/Card';
import { Icon } from '@/components/icons/Icon';
import { PageHeader } from '@/components/ui/layout/PageHeader';

export type Panel = {
    title: string;
    subtitle?: string;
    body: ReactNode;
    submit?: string;
    save?: (data: FormData) => void;
    message?: string;
    confirm?: boolean;
};

function PanelForm({ panel, close }: { panel: Panel; close: () => void }) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        const dialog = ref.current;
        dialog?.showModal();
        return () => dialog?.close();
    }, []);
    return <dialog ref={ref} aria-labelledby="registry-panel-title" onCancel={close}
        className={panel.confirm ? 'm-auto w-[min(92vw,460px)] rounded-xl p-0 shadow-xl backdrop:bg-black/35' : 'ml-auto mr-0 inset-y-0 h-dvh max-h-none w-[min(100vw,460px)] p-0 shadow-xl backdrop:bg-black/35'}>
        <form className="flex max-h-dvh h-full flex-col" onSubmit={e => {
            e.preventDefault();
            panel.save?.(new FormData(e.currentTarget));
            close();
        }}>
            <div className="flex justify-between border-b p-5"><div><h2 id="registry-panel-title" className="font-semibold">{panel.title}</h2><p className="text-sm text-slate-500">{panel.subtitle}</p></div>
                <button type="button" aria-label="Close panel" onClick={close}>✕</button></div>
            <div className="flex-1 space-y-4 overflow-auto p-5">{panel.body}</div>
            <div className="flex justify-end gap-2 border-t p-4"><Action onClick={close} variant="outline">{panel.confirm ? 'Cancel' : 'Close'}</Action>
                {panel.submit && <button className="btn btn-primary" type="submit">{panel.submit}</button>}</div>
        </form>
    </dialog>;
}

export function useDesk() {
    const [panel, open] = useState<Panel | null>(null);
    const [notice, notify] = useState('');
    function show(value: Panel) {
        open({ ...value, save: data => {
            value.save?.(data);
            notify(value.message ?? `${value.title} saved`);
        } });
    }
    return { show, notify, overlay: <>{notice && <div role="status" className="fixed bottom-5 right-5 z-40 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white">{notice} <button aria-label="Dismiss notification" onClick={() => notify('')}>×</button></div>}
        {panel && <PanelForm key={panel.title} panel={panel} close={() => open(null)} />}</> };
}

export type Desk = ReturnType<typeof useDesk>;
export type Tab = [string, number?];
export function Register({ eyebrow, title, description, actions, tabs, active, select, children, overlay }: {
    eyebrow: string; title: string; description: string; actions: ReactNode; tabs?: Tab[];
    active?: number; select?: (i: number) => void; children: ReactNode; overlay: ReactNode;
}) {
    return <><PageHeader {...{ eyebrow, title, description, actions }} />
        <div className="min-w-0 space-y-5">
            {tabs ? <Tabs.Root value={String(active)} onValueChange={v => select?.(Number(v))} className="space-y-5">
                <Card bodyClassName="p-0"><div className="overflow-x-auto border-b border-ink-100"><Tabs.List aria-label={`${title} sections`} className="flex min-w-max gap-1">
                    {tabs.map(([label,count],i) => <Tabs.Trigger key={label} value={String(i)} className="whitespace-nowrap border-b-2 border-transparent px-3.5 py-2.5 text-sm font-medium text-ink-500 data-[state=active]:border-brand-600 data-[state=active]:text-brand-800">
                        {label}{count !== undefined && <span className="ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[11px] font-semibold text-ink-600">{count}</span>}</Tabs.Trigger>)}
                </Tabs.List></div></Card><Tabs.Content value={String(active)} className="space-y-5">{children}</Tabs.Content>
            </Tabs.Root> : children}
        </div>{overlay}</>;
}

export function Field({ label, value, options, type = 'text', required, readOnly }: {
    label: string; value?: string | number; options?: string[]; type?: string; required?: boolean; readOnly?: boolean;
}) {
    return <label className="block"><span className="label">{label}</span>
        {options ? <select className="select block w-full" aria-label={label} name={label} defaultValue={value}>{options.map(o => <option key={o}>{o}</option>)}</select>
            : type === 'textarea' ? <textarea className="input block w-full" rows={3} name={label} defaultValue={value} required={required}/>
            : <input className="input block w-full" {...{ type, required, readOnly }} name={label} defaultValue={value} />}</label>;
}

export function Note({ children, amber }: { children: ReactNode; amber?: boolean }) {
    return <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${amber ? 'border-amber-200 bg-amber-50/70 text-amber-900' : 'border-sky-200 bg-sky-50/70 text-sky-900'}`}><Icon name={amber?'alert':'info'} className="mt-0.5 size-4 shrink-0"/><span>{children}</span></div>;
}

export function exportRecords(name: string, records: object[]) {
    const file = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
