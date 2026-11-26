import { useId, type ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import { MountedDialog } from '@/components/ui/overlays/MountedDialog';

interface DrawerProps {
    title: string;
    subtitle?: string;
    close: () => void;
    children: ReactNode;
}

export function Drawer({ title, subtitle, close, children }: DrawerProps) {
    const id = useId();

    return (
        <MountedDialog
            labelledBy={id}
            close={close}
            className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-xl overflow-auto bg-white p-0 text-slate-800 shadow-xl backdrop:bg-slate-900/45"
        >
            <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ink-100 bg-white px-5 py-4">
                <div>
                    <h2 id={id} className="text-[15px] font-semibold">
                        {title}
                    </h2>
                    <p className="mt-0.5 text-[13px] text-ink-500">{subtitle}</p>
                </div>
                <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    aria-label="Close panel"
                    onClick={close}
                >
                    <Icon name="close" className="size-4" />
                </button>
            </header>
            <div className="space-y-4 p-5">{children}</div>
        </MountedDialog>
    );
}
