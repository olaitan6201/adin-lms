import { useState, type FormEvent } from 'react';

export type Format = 'native' | 'scorm';

export function useCourseTransfer(offering: string, format: Format, valid: boolean, label: string) {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const path = `/operations/courses/${encodeURIComponent(offering)}`;

    async function transfer(event: FormEvent<HTMLFormElement>, importing: boolean) {
        event.preventDefault();
        if (!valid || busy) return;

        const form = event.currentTarget;
        setBusy(true);
        setMessage('');
        setError('');
        try {
            const response = await fetch(importing ? `${path}/import` : `${path}/export/${format}`, {
                method: importing ? 'POST' : 'GET',
                headers: { Accept: 'application/json' },
                body: importing ? new FormData(form) : undefined,
            });
            if (!response.ok || response.redirected) {
                const failure = await response.json().catch(() => ({}));
                throw new Error(
                    failure.errors?.package?.[0] ??
                        failure.errors?.file?.[0] ??
                        failure.message ??
                        'Transfer failed. Check your session and try again.',
                );
            }

            if (importing) {
                const result = await response.json();
                setMessage(`Restored ${result.imported} course record(s) to ${label}.`);
                form.reset();
            } else {
                const url = URL.createObjectURL(await response.blob());
                const link = document.createElement('a');
                link.href = url;
                link.download = `course-${offering}-${format}.zip`;
                link.click();
                window.setTimeout(() => URL.revokeObjectURL(url), 30000);
                setMessage('Package ready. Check your downloads.');
            }
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : 'Transfer failed.');
        } finally {
            setBusy(false);
        }
    }

    function clearFeedback() {
        setError('');
        setMessage('');
    }

    return { busy, error, message, transfer, clearFeedback };
}
