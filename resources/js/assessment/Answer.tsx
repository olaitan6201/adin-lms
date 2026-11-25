import { useEffect, useRef, useState } from 'react';

export type Question = {
    id: string;
    prompt: string;
    options: string[];
    value: string;
    revision: number;
};

export function Answer({
    question: q,
    url,
    active,
    onDirty,
}: {
    question: Question;
    url: string;
    active: boolean;
    onDirty: (id: string, dirty: boolean) => void;
}) {
    const [value, setValue] = useState(q.value);
    const [message, setMessage] = useState('Saved');
    const [retry, setRetry] = useState(0);
    const [saved, setSaved] = useState(q.value);
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);
    const revision = useRef(q.revision);
    const latest = useRef(value);
    latest.current = value;
    useEffect(() => {
        if (!active || saved === value || busy || failed) return;

        const timer = window.setTimeout(async () => {
            setBusy(true);
            setMessage('Saving…');
            try {
                const token = decodeURIComponent(
                    document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                );
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': token,
                    },
                    body: JSON.stringify({ answer: value, revision: revision.current }),
                });
                if (!response.ok)
                    throw new Error(
                        response.status === 409
                            ? 'Paper changed or closed. Copy your draft before reloading.'
                            : 'Save failed. Retry before submitting.',
                    );

                const data = (await response.json()) as { revision: number };
                revision.current = data.revision;
                setSaved(value);
                setMessage(latest.current === value ? 'Saved' : 'Unsaved');
            } catch (error) {
                setFailed(true);
                setMessage(error instanceof Error ? error.message : 'Save failed.');
            } finally {
                setBusy(false);
            }
        }, 450);

        return () => window.clearTimeout(timer);
    }, [value, busy, failed, saved, retry, url, active]);
    useEffect(() => onDirty(q.id, saved !== value || busy), [q.id, saved, value, busy, onDirty]);
    const edit = (v: string) => {
        setValue(v);
        setMessage(v === saved && !busy ? 'Saved' : 'Unsaved');
    };

    return (
        <section>
            <label>
                {q.prompt}
                {q.options.length ? (
                    <select disabled={!active} value={value} onChange={(e) => edit(e.target.value)}>
                        <option value="">Select an answer</option>
                        {q.options.map((o) => (
                            <option key={o}>{o}</option>
                        ))}
                    </select>
                ) : (
                    <textarea disabled={!active} value={value} onChange={(e) => edit(e.target.value)} />
                )}
            </label>
            <span role="status">{message}</span>
            {failed && (
                <button
                    onClick={() => {
                        setFailed(false);
                        setRetry(retry + 1);
                    }}
                >
                    Retry save
                </button>
            )}
        </section>
    );
}
