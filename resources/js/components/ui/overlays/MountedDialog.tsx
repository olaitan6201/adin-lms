import { useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';

interface MountedDialogProps {
    labelledBy: string;
    className: string;
    close: () => void;
    children: ReactNode;
    wrapTabFocus?: boolean;
}

function keepTabInDialog(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) {
        return;
    }

    const controls = event.currentTarget.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex]');
    const tabbable = Array.from(controls).filter(control => (
        control.tabIndex >= 0 && !control.matches(':disabled') && control.getClientRects().length > 0
    ));
    const first = tabbable[0];
    const last = tabbable.at(-1);
    const boundary = event.shiftKey ? first : last;
    const destination = event.shiftKey ? last : first;

    if (event.target === boundary && destination) {
        event.preventDefault();
        destination.focus();
    }
}

/** Mount on selection; restore focus before the selected dialog leaves the DOM. */
export function MountedDialog({ labelledBy, className, close, children, wrapTabFocus }: MountedDialogProps) {
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
            onKeyDown={wrapTabFocus ? keepTabInDialog : undefined}
            onCancel={event => {
                event.preventDefault();
                close();
            }}
        >
            {children}
        </dialog>
    );
}
