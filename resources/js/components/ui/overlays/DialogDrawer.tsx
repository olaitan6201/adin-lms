import { useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useMountedDialog } from './useMountedDialog';

export function Drawer({ title, subtitle, children, close }: { title: string; subtitle?: string; children: ReactNode; close: () => void }) {
    const ref = useMountedDialog();
    const heading = useId();
    return <dialog ref={ref} aria-labelledby={heading} onCancel={close} className="fixed inset-y-0 right-0 left-auto m-0 ml-auto h-dvh max-h-dvh w-full max-w-md overflow-y-auto bg-white p-0 shadow-xl backdrop:bg-ink-900/45">
        <header className="flex items-start justify-between gap-3 border-b p-5">
            <div><h2 id={heading} className="font-semibold">{title}</h2>{subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}</div>
            <button type="button" className="btn btn-ghost btn-sm" aria-label="Close panel" onClick={close}><X size={18}/></button>
        </header>
        <div className="space-y-4 p-5 text-sm">{children}</div>
    </dialog>;
}
