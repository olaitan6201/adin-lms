import { useHttp } from '@inertiajs/react';
import { useLayoutEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { guessColumns, type Columns, type ImportField, type ImportKind, type ImportUrls } from './structureImportFields';
import type { Preview } from './StructureImportPreview';

type Payload = { file: File | null; columns: Columns; confirmation: string | null };
type Reply = { headers: string[] } | Preview | { created: number };
type Step = 'columns' | 'preview' | 'store';
type Result = 'mapping' | 'preview' | 'error';

export function useStructureImport(kind: ImportKind, urls: ImportUrls, close: () => void, imported: (count: number) => void) {
    const [headers, setHeaders] = useState<string[]>([]);
    const [preview, setPreview] = useState<Preview | null>(null);
    const [requestError, setRequestError] = useState('');
    const [pending, setPending] = useState<Step | null>(null);
    const [result, setResult] = useState<Result | null>(null);
    const request = useRef<'idle' | 'pending' | 'unmounted'>('idle');
    const form = useHttp<Payload, Reply>({ file: null, columns: guessColumns(kind, []), confirmation: null });
    const step: Step = form.data.confirmation ? 'store' : headers.length ? 'preview' : 'columns';

    useLayoutEffect(() => {
        request.current = 'idle';

        return () => {
            request.current = 'unmounted';
        };
    }, []);

    function dismiss() {
        if (request.current === 'idle') {
            close();
        }
    }

    function selectFile(event: ChangeEvent<HTMLInputElement>) {
        if (request.current !== 'idle') {
            return;
        }

        setHeaders([]);
        setPreview(null);
        setResult(null);
        setRequestError('');
        form.clearErrors();
        form.setData({ file: event.target.files?.[0] ?? null, columns: guessColumns(kind, []), confirmation: null });
    }

    function mapColumn(field: ImportField, value: string) {
        if (request.current !== 'idle') {
            return;
        }

        form.setData(previous => ({
            ...previous,
            columns: { ...previous.columns, [field]: value === '' ? null : Number(value) },
            confirmation: null,
        }));
        setPreview(null);
        setRequestError('');
        setResult(null);
        form.clearErrors();
    }

    function showError(message: string) {
        setRequestError(message);
        setPreview(null);
        form.setData('confirmation', null);
        setResult('error');
    }

    function applyReply(reply: Reply) {
        if ('headers' in reply) {
            setHeaders(reply.headers);
            form.setData('columns', guessColumns(kind, reply.headers));
            setResult('mapping');
        } else if ('confirmation' in reply) {
            setPreview(reply);
            form.setData('confirmation', Object.keys(reply.errors).length ? null : reply.confirmation);
            setResult('preview');
        } else {
            imported(reply.created);
        }
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (request.current !== 'idle' || !form.data.file) {
            return;
        }

        request.current = 'pending';
        setPending(step);
        setResult(null);
        setRequestError('');
        try {
            const reply = await form.post(urls[step]);
            if (request.current === 'pending') {
                if (reply) {
                    applyReply(reply);
                } else {
                    showError('The request could not be completed. Check the details below or try again.');
                }
            }
        } catch {
            if (request.current === 'pending') {
                const message = step === 'store'
                    ? 'The import result could not be verified. Preview again to check which records are already present.'
                    : 'The request could not be completed. Check the details below or try again.';
                showError(message);
            }
        } finally {
            if (request.current === 'pending') {
                request.current = 'idle';
                setPending(null);
            }
        }
    }

    return { form, headers, preview, requestError, pending, result, step, dismiss, selectFile, mapColumn, submit };
}
