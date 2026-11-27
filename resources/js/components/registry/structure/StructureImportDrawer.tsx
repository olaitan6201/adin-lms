import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { useHttp } from '@inertiajs/react';
import { Action } from '@/components/ui/controls/Action';
import { MountedDialog } from '@/components/ui/overlays/MountedDialog';

import { ImportColumnMapping, emptyColumns, guessColumns, type Columns, type Field } from './ImportColumnMapping';
import { StructureImportPreview, type Preview } from './StructureImportPreview';

type Payload = { file: File | null; columns: Columns; confirmation: string | null };
type Endpoints = { template: string; columns: string; preview: string; store: string };
type Reply = { headers: string[] } | Preview | { created: number };

export function StructureImportDrawer({ urls, close, imported }: {
    urls: Endpoints;
    close: () => void;
    imported: (count: number) => void;
}) {
    const title = useId();
    const [headers, setHeaders] = useState<string[]>([]);
    const [preview, setPreview] = useState<Preview | null>(null);
    const [requestError, setRequestError] = useState('');
    const form = useHttp<Payload, Reply>({ file: null, columns: emptyColumns, confirmation: null });

    function selectFile(event: ChangeEvent<HTMLInputElement>) {
        setHeaders([]);
        setPreview(null);
        setRequestError('');
        form.clearErrors();
        form.setData({ file: event.target.files?.[0] ?? null, columns: emptyColumns, confirmation: null });
    }

    function mapColumn(field: Field, value: string) {
        form.setData(previous => ({
            ...previous,
            columns: { ...previous.columns, [field]: value === '' ? null : Number(value) },
            confirmation: null,
        }));
        setPreview(null);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setRequestError('');
        const endpoint = form.data.confirmation ? urls.store : headers.length ? urls.preview : urls.columns;
        try {
            const result = await form.post(endpoint);
            if ('headers' in result) {
                setHeaders(result.headers);
                form.setData('columns', guessColumns(result.headers));
            } else if ('confirmation' in result) {
                setPreview(result);
                form.setData('confirmation', result.confirmation);
            } else {
                imported(result.created);
            }
        } catch {
            setRequestError('The request could not be completed. Check the details below or try again.');
            setPreview(null);
            form.setData('confirmation', null);
        }
    }

    return (
        <MountedDialog labelledBy={title} close={close} className="fixed inset-y-0 right-0 ml-auto mr-0 h-dvh max-h-none w-full max-w-[560px] border-l border-ink-100 bg-white p-0 shadow-xl backdrop:bg-ink-950/45">
            <form className="flex h-full max-h-dvh flex-col" onSubmit={submit}>
                <div className="border-b border-ink-100 p-5">
                    <h2 className="text-base font-semibold text-ink-900" id={title}>Import structure</h2>
                    <p className="mt-1 text-sm text-ink-600">Upload a CSV or single-sheet XLSX to add faculties, departments and programmes.</p>
                </div>
                <div className="flex-1 space-y-4 overflow-auto p-5">
                    <a className="text-sm font-medium text-brand-800 underline" href={urls.template}>Download example CSV</a>
                    <label className="grid gap-2 text-sm font-medium">
                        Structure file (up to 2 MB)
                        <input
                            type="file"
                            accept=".csv,.xlsx"
                            onChange={selectFile}
                            disabled={form.processing}
                            required
                        />
                    </label>
                    {headers.length > 0 && (
                        <ImportColumnMapping
                            headers={headers}
                            columns={form.data.columns}
                            disabled={form.processing}
                            mapColumn={mapColumn}
                        />
                    )}
                    {preview && <StructureImportPreview preview={preview} />}
                    {requestError && (
                        <div role="alert" className="space-y-1 text-sm">
                            <p>{requestError}</p>
                            {Object.entries(form.errors).map(([key, message]) => (
                                <p key={key}>{message}</p>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 border-t border-ink-100 p-4">
                    <Action onClick={close} variant="outline">Close</Action>
                    <button className="btn btn-primary" type="submit" disabled={!form.data.file || form.processing}>
                        {form.data.confirmation ? 'Confirm import' : headers.length ? 'Preview import' : 'Read columns'}
                    </button>
                </div>
            </form>
        </MountedDialog>
    );
}
