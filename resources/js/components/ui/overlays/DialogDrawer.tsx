import { useId, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { MountedDialog } from './MountedDialog';

export function Drawer({
    title,
    subtitle,
    children,
    close,
    closeDisabled = false,
    className = '',
    wrapTabFocus,
}: {
    title: string;
    subtitle?: string;
    children: ReactNode;
    close: () => void;
    closeDisabled?: boolean;
    className?: string;
    wrapTabFocus?: boolean;
}) {
    const heading = useId();

    function dismiss() {
        if (!closeDisabled) {
            close();
        }
    }

    return (
        <MountedDialog
            labelledBy={heading}
            close={dismiss}
            className={`fixed inset-y-0 right-0 left-auto m-0 ml-auto h-dvh max-h-dvh w-full max-w-md overflow-y-auto bg-white p-0 shadow-xl backdrop:bg-ink-900/45 ${className}`}
            wrapTabFocus={wrapTabFocus}
        >
            <header className="flex items-start justify-between gap-3 border-b p-5">
                <div className="min-w-0 wrap-anywhere">
                    <h2 id={heading} className="font-semibold">
                        {title}
                    </h2>
                    {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
                </div>
                <button
                    type="button"
                    className="btn btn-ghost btn-sm shrink-0"
                    aria-label="Close panel"
                    disabled={closeDisabled}
                    onClick={dismiss}
                >
                    <X size={18} aria-hidden="true" />
                </button>
            </header>
            <div className="space-y-4 p-5 text-sm">{children}</div>
        </MountedDialog>
    );
}
