import { useLayoutEffect, useRef, type ReactNode } from 'react';

interface MountedDialogProps {
    labelledBy: string;
    className: string;
    close: () => void;
    children: ReactNode;
}

/** Mount on selection; restore focus before the selected dialog leaves the DOM. */
export function MountedDialog({ labelledBy, className, close, children }: MountedDialogProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useLayoutEffect(() => {
        const dialog = ref.current;
        const opener = document.activeElement;
        dialog?.showModal();

        return () => {
            dialog?.close();
            if (opener instanceof HTMLElement && opener.isConnected) {
                opener.focus({ preventScroll: true });
            }
        };
    }, []);

    return (
        <dialog
            ref={ref}
            aria-labelledby={labelledBy}
            className={className}
            onCancel={event => {
                event.preventDefault();
                close();
            }}
        >
            {children}
        </dialog>
    );
}
