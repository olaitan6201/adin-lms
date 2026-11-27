import { useId, useLayoutEffect, useRef } from 'react';
import { Action } from '@/components/ui/controls/Action';
import { MountedDialog } from '@/components/ui/overlays/MountedDialog';
import { ImportColumnMapping } from './ImportColumnMapping';
import { StructureImportPreview } from './StructureImportPreview';
import type { ImportKind, ImportUrls } from './structureImportFields';
import { useStructureImport } from './useStructureImport';

const titles = { hierarchy: 'Import structure', register: 'Import shared register' };
const actionLabels = { columns: 'Read columns', preview: 'Preview import', store: 'Confirm import' };
const pendingLabels = { columns: 'Reading columns…', preview: 'Preparing preview…', store: 'Importing records…' };

type DrawerProps = {
    kind: ImportKind;
    urls: ImportUrls;
    close: () => void;
    imported: (count: number) => void;
};

export function StructureImportDrawer({ kind, urls, close, imported }: DrawerProps) {
    const title = useId();
    const statusRef = useRef<HTMLParagraphElement>(null);
    const resultRef = useRef<HTMLDivElement>(null);
    const wizard = useStructureImport(kind, urls, close, imported);
    const { form, headers, pending, preview, requestError, result, step } = wizard;
    const sharedRegister = kind === 'register';

    useLayoutEffect(() => {
        if (pending) {
            statusRef.current?.focus();
        } else if (result) {
            resultRef.current?.focus();
        }
    }, [pending, result]);

    return (
        <MountedDialog
            labelledBy={title}
            close={wizard.dismiss}
            className={`fixed inset-y-0 right-0 ml-auto mr-0 h-dvh max-h-none w-full max-w-[560px] border-l border-ink-100 bg-white p-0 shadow-xl backdrop:bg-ink-950/45 ${sharedRegister ? 'structure-register-drawer' : ''}`}
            wrapTabFocus
        >
            <form className="flex h-full max-h-dvh flex-col" onSubmit={wizard.submit}>
                <div className="border-b border-ink-100 p-5">
                    <h2 className="text-base font-semibold text-ink-900" id={title}>
                        {titles[kind]}
                    </h2>
                    <p className="mt-1 text-sm text-ink-600">
                        {sharedRegister
                            ? 'Add shared programmes, programme levels, specializations and pathways from a CSV or single-sheet XLSX.'
                            : 'Upload a CSV or single-sheet XLSX to add faculties, departments and programmes.'}
                    </p>
                </div>
                <div className="min-h-0 flex-1 space-y-4 overflow-auto overscroll-contain p-5">
                    <a className="text-sm font-medium text-brand-800 underline" href={urls.template}>
                        Download example CSV
                    </a>
                    {sharedRegister && (
                        <p className="text-sm text-ink-600">
                            This import adds records only. Exact matches are skipped and conflicts block the import.
                            Replace the example department code with an existing department code.
                        </p>
                    )}
                    <label className="grid min-w-0 gap-2 text-sm font-medium">
                        {sharedRegister ? 'Shared register file (up to 2 MB)' : 'Structure file (up to 2 MB)'}
                        <input
                            className={sharedRegister ? 'w-full min-w-0 rounded-md border p-2' : 'w-full min-w-0'}
                            type="file"
                            accept=".csv,.xlsx"
                            onChange={wizard.selectFile}
                            disabled={pending !== null}
                            required
                        />
                    </label>
                    {headers.length > 0 && (
                        <div
                            ref={result === 'mapping' ? resultRef : undefined}
                            role="group"
                            aria-label="Column mapping"
                            tabIndex={-1}
                        >
                            <ImportColumnMapping
                                kind={kind}
                                headers={headers}
                                columns={form.data.columns}
                                disabled={pending !== null}
                                mapColumn={wizard.mapColumn}
                            />
                        </div>
                    )}
                    {preview && (
                        <div
                            ref={result === 'preview' ? resultRef : undefined}
                            role="group"
                            aria-label="Import preview"
                            tabIndex={-1}
                        >
                            <StructureImportPreview preview={preview} explainErrors={sharedRegister} />
                        </div>
                    )}
                    {requestError && (
                        <div
                            ref={resultRef}
                            tabIndex={-1}
                            role="alert"
                            className="space-y-1 text-sm"
                        >
                            <p>{requestError}</p>
                            {Object.entries(form.errors).map(([key, message]) => (
                                <p key={key}>{message}</p>
                            ))}
                        </div>
                    )}
                </div>
                <div className="space-y-2 border-t border-ink-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <p
                        ref={statusRef}
                        role="status"
                        tabIndex={-1}
                        className={pending ? 'text-sm text-ink-700' : 'sr-only'}
                    >
                        {pending ? pendingLabels[pending] : ''}
                    </p>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Action onClick={wizard.dismiss} variant="outline" disabled={pending !== null}>
                            Close
                        </Action>
                        <button
                            className="btn btn-primary"
                            type="submit"
                            disabled={!form.data.file || pending !== null}
                        >
                            {actionLabels[step]}
                        </button>
                    </div>
                </div>
            </form>
        </MountedDialog>
    );
}
