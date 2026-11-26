import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Icon } from '@/components/icons/Icon';
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { useWorkspaceToasts, WorkspaceToasts, type Tone } from './WorkspaceToasts';

type Drawer = {
    title: string;
    description?: string;
    content: ReactNode
};
type Confirmation = {
    title: string;
    body: string;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm: () => void
};
type OverlayApi = {
    notify: (message: string, tone?: Tone) => void;
    openDrawer: (drawer: Drawer) => void;
    confirm: (confirmation: Confirmation) => void;
    close: () => void;
};
const OverlayContext = createContext<OverlayApi | null>(null);

export function useWorkspaceOverlays() {
    const overlays = useContext(OverlayContext);
    if (!overlays) throw new Error('Workspace overlays require a workspace layout.');

    return overlays;
}

export function WorkspaceOverlays({ children }: { children: ReactNode }) {
    const [drawer, setDrawer] = useState<Drawer | null>(null);
    const [confirmation, confirm] = useState<Confirmation | null>(null);
    const { toasts, notify } = useWorkspaceToasts();
    const origin = useRef<HTMLElement | null>(null);
    function close() {
        setDrawer(null);
        confirm(null);
    }

    function rememberFocus() {
        origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }

    function restoreFocus(event: Event) {
        if (origin.current?.isConnected) {
            event.preventDefault();
            origin.current.focus();
        }
    }

    return (
        <OverlayContext.Provider
            value={{
                notify,
                close,
                openDrawer: value => {
                    rememberFocus();
                    setDrawer(value);
                },
                confirm: value => {
                    rememberFocus();
                    confirm(value);
                },
            }}
        >
            {children}
            <Sheet
                open={!!drawer}
                onOpenChange={open => {
                    if (!open) setDrawer(null);
                }}
            >
                {drawer && (
                    <SheetContent className="ws-detail-drawer" showCloseButton={false} onCloseAutoFocus={restoreFocus}>
                        <div className="border-b border-ink-100 p-5 pr-12">
                            <SheetTitle>{drawer.title}</SheetTitle>
                            <SheetDescription className={drawer.description ? '' : 'sr-only'}>
                                {drawer.description ?? drawer.title}
                            </SheetDescription>
                        </div>
                        <div className="min-h-0 flex-1 overflow-auto p-5" data-scroll>
                            {drawer.content}
                        </div>
                        <SheetClose className="portal-icon absolute top-3 right-3" aria-label="Close panel">
                            <Icon name="close" className="size-4" />
                        </SheetClose>
                    </SheetContent>
                )}
            </Sheet>
            <Dialog
                open={!!confirmation}
                onOpenChange={open => {
                    if (!open) confirm(null);
                }}
            >
                {confirmation && (
                    <DialogContent showCloseButton={false} className="ws-confirm" onCloseAutoFocus={restoreFocus}>
                        <DialogTitle className="text-[15px]">{confirmation.title}</DialogTitle>
                        <DialogDescription className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
                            {confirmation.body}
                        </DialogDescription>
                        <div className="mt-5 flex justify-end gap-2">
                            <DialogClose className="btn btn-outline">Cancel</DialogClose>
                            <button
                                type="button"
                                className={`btn ${confirmation.danger ? 'btn-danger' : 'btn-primary'}`}
                                onClick={() => {
                                    confirm(null);
                                    confirmation.onConfirm();
                                }}
                            >
                                {confirmation.confirmLabel ?? 'Confirm'}
                            </button>
                        </div>
                    </DialogContent>
                )}
            </Dialog>
            <WorkspaceToasts toasts={toasts} />
        </OverlayContext.Provider>
    );
}
