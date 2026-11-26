import { useRef, useState, type ReactNode, type SubmitEvent } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Action } from '@/components/ui/controls/Action';
import { MountedDialog } from '@/components/ui/overlays/MountedDialog';

export type Panel = {
    title: string;
    subtitle?: string;
    body: ReactNode;
    confirm?: boolean;
    cancel?: string;
    portrait?: ReactNode;
} & (
    | { submit: string; save: (data: FormData) => void | string; message?: string; previewNotice?: never }
    | { submit: string; previewNotice: string; save?: never; message?: never }
    | { submit?: never; save?: never; message?: never; previewNotice?: never }
);

export function PanelForm({ panel, close, notify }: { panel: Panel; close: () => void; notify?: (notice: string) => void }) {
    const [error, setError] = useState('');
    const className = panel.confirm
        ? 'm-auto w-[min(92vw,460px)] rounded-xl p-0 shadow-xl backdrop:bg-ink-950/45'
        : 'fixed inset-y-0 right-0 ml-auto mr-0 h-dvh max-h-none w-full max-w-[560px] border-l border-ink-100 bg-white p-0 shadow-xl backdrop:bg-ink-950/45 backdrop:backdrop-blur-[2px]';

    function submit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!panel.submit) return;
        if (panel.save) {
            const rejection = panel.save(new FormData(event.currentTarget));
            if (typeof rejection === 'string') {
                setError(rejection);
                return;
            }
            notify?.(panel.message ?? `${panel.title} saved`);
        } else if (panel.previewNotice) {
            notify?.(panel.previewNotice);
        }
        close();
    }

    return (
        <MountedDialog labelledBy="registry-panel-title" close={close} className={className}>
            <form className="flex max-h-dvh h-full flex-col" onSubmit={submit}>
                <div className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                        {panel.portrait}
                        <div>
                            <h2 id="registry-panel-title" className="text-[15px] font-semibold text-ink-900">{panel.title}</h2>
                            <p className="mt-0.5 text-[13px] text-ink-500">{panel.subtitle}</p>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" type="button" aria-label="Close panel" onClick={close}>
                        <Icon name="close" className="size-4" />
                    </button>
                </div>
                <div className="flex-1 space-y-4 overflow-auto p-5">{panel.body}</div>
                {error && <p role="alert" className="px-4 text-sm">{error}</p>}
                <div className="flex justify-end gap-2 border-t border-ink-100 p-4">
                    <Action onClick={close} variant="outline">{panel.cancel ?? (panel.confirm ? 'Cancel' : 'Close')}</Action>
                    {panel.submit && <button className="btn btn-primary" type="submit">{panel.submit}</button>}
                </div>
            </form>
        </MountedDialog>
    );
}

export function useDesk() {
    const [selection, open] = useState<{ key: number; panel: Panel } | null>(null);
    const nextKey = useRef(0);
    const [notice, notify] = useState('');

    function show(value: Panel) {
        open({ key: ++nextKey.current, panel: value });
    }

    const overlay = (
        <>
            {notice && (
                <div role="status" className="fixed bottom-5 right-5 z-40 rounded-lg bg-slate-900 px-4 py-3 text-sm text-white">
                    {notice}{' '}
                    <button aria-label="Dismiss notification" onClick={() => notify('')}>×</button>
                </div>
            )}
            {selection && <PanelForm key={selection.key} panel={selection.panel} notify={notify} close={() => open(null)} />}
        </>
    );

    return { show, notify, overlay };
}

export type Desk = ReturnType<typeof useDesk>;
