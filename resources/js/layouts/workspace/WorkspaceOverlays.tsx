import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Icon } from '@/components/icons/Icon';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type Tone = 'emerald' | 'amber' | 'rose' | 'sky';
type Drawer = { title: string; description?: string; content: ReactNode };
type Confirmation = { title: string; body: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void };
type OverlayApi = {
    notify: (message: string, tone?: Tone) => void;
    openDrawer: (drawer: Drawer) => void;
    confirm: (confirmation: Confirmation) => void;
    close: () => void;
};
const OverlayContext = createContext<OverlayApi | null>(null);
const colors: Record<Tone, string> = {
    emerald: 'border-brand-200 bg-brand-50 text-brand-900', amber: 'border-amber-200 bg-amber-50 text-amber-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900', sky: 'border-sky-200 bg-sky-50 text-sky-900',
};

export function useWorkspaceOverlays() {
    const overlays = useContext(OverlayContext);
    if (!overlays) throw new Error('Workspace overlays require a workspace layout.');
    return overlays;
}

export function WorkspaceOverlays({ children }: { children: ReactNode }) {
    const [drawer, setDrawer] = useState<Drawer | null>(null);
    const [confirmation, confirm] = useState<Confirmation | null>(null);
    const [toasts, setToasts] = useState<{ id: number; message: string; tone: Tone }[]>([]);
    const timers = useRef(new Set<number>());
    const origin = useRef<HTMLElement | null>(null);
    useEffect(() => {
        const pending = timers.current;
        return () => pending.forEach(timer => window.clearTimeout(timer));
    }, []);
    const notify = useCallback((message: string, tone: Tone = 'emerald') => {
        const id = window.setTimeout(() => {
            setToasts(current => current.filter(item => item.id !== id));
            timers.current.delete(id);
        }, 3800);
        timers.current.add(id);
        setToasts(current => [...current, { id, message, tone }]);
    }, []);
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
    return <OverlayContext.Provider value={{ notify, close, openDrawer: value => {
        rememberFocus();
        setDrawer(value);
    }, confirm: value => {
        rememberFocus();
        confirm(value);
    } }}>
        {children}
        <Sheet open={!!drawer} onOpenChange={open => { if (!open) setDrawer(null); }}>
            {drawer && <SheetContent className="ws-detail-drawer" showCloseButton={false} onCloseAutoFocus={restoreFocus}>
                <div className="border-b border-ink-100 p-5 pr-12"><SheetTitle>{drawer.title}</SheetTitle>
                    <SheetDescription className={drawer.description ? '' : 'sr-only'}>{drawer.description ?? drawer.title}</SheetDescription></div>
                <div className="min-h-0 flex-1 overflow-auto p-5" data-scroll>{drawer.content}</div>
                <SheetClose className="portal-icon absolute top-3 right-3" aria-label="Close panel">
                    <Icon name="close" className="size-4" />
                </SheetClose>
            </SheetContent>}
        </Sheet>
        <Dialog open={!!confirmation} onOpenChange={open => { if (!open) confirm(null); }}>
            {confirmation && <DialogContent showCloseButton={false} className="ws-confirm" onCloseAutoFocus={restoreFocus}>
                <DialogTitle className="text-[15px]">{confirmation.title}</DialogTitle>
                <DialogDescription className="mt-1.5 text-[13px] leading-relaxed text-ink-500">{confirmation.body}</DialogDescription>
                <div className="mt-5 flex justify-end gap-2"><DialogClose className="btn btn-outline">Cancel</DialogClose>
                    <button type="button" className={`btn ${confirmation.danger ? 'btn-danger' : 'btn-primary'}`} onClick={() => {
                        confirm(null);
                        confirmation.onConfirm();
                    }}>{confirmation.confirmLabel ?? 'Confirm'}</button>
                </div>
            </DialogContent>}
        </Dialog>
        <div role="status" aria-live="polite" className="pointer-events-none fixed right-5 bottom-5 z-[70] flex w-[min(92vw,380px)] flex-col gap-2">
            {toasts.map(({ id, message, tone }) => {
                const icon = tone === 'amber' || tone === 'rose' ? 'alert' : 'check';
                return <div key={id} className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] shadow-lift motion-safe:animate-fade-up ${colors[tone]}`}>
                    <Icon name={icon} className="mt-0.5 size-4 shrink-0" />{message}</div>;
            })}
        </div>
    </OverlayContext.Provider>;
}
