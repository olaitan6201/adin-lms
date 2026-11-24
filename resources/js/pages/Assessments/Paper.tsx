import '../../assessment/assessment.css';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Question = { id: string; prompt: string; options: string[]; value: string; revision: number };
type Props = { attempt: { id: string; state: string; expires_at: string }; questions: Question[]; title: string };
function Answer({
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
    const [value, setValue] = useState(q.value),
        [message, setMessage] = useState('Saved'),
        [retry, setRetry] = useState(0);
    const [saved, setSaved] = useState(q.value),
        [busy, setBusy] = useState(false),
        [failed, setFailed] = useState(false);
    const revision = useRef(q.revision);
    const latest = useRef(value);
    latest.current = value;
    useEffect(() => {
        if (!active || saved === value || busy || failed) return;
        const timer = window.setTimeout(async () => {
            setBusy(true);
            setMessage('Saving…');
            try {
                const token = decodeURIComponent(document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1] ?? '');
                const response = await fetch(url, {
                    method: 'PUT',
                    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-XSRF-TOKEN': token },
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
export default function Paper({ attempt, questions, title }: Props) {
    const [dirty, setDirty] = useState<string[]>([]);
    const change = useCallback(
        (id: string, pending: boolean) =>
            setDirty((ids) => (ids.includes(id) === pending ? ids : pending ? [...ids, id] : ids.filter((x) => x !== id))),
        [],
    );
    const active = attempt.state === 'active';
    return (
        <main className="assessment-page">
            <Head title={title} />
            <h1>{title}</h1>
            <p>
                Status: {attempt.state} · Deadline: {new Date(attempt.expires_at).toLocaleString()}
            </p>
            <p>
                Answers save online. Wait for Saved before leaving. This browser cannot prevent other apps or verify who is
                present.
            </p>
            {questions.map((q) => (
                <Answer
                    key={q.id}
                    question={q}
                    url={`/attempts/${attempt.id}/answers/${q.id}`}
                    active={active}
                    onDirty={change}
                />
            ))}
            {active && (
                <button disabled={dirty.length > 0} onClick={() => router.post(`/attempts/${attempt.id}/finish`)}>
                    Submit final answers
                </button>
            )}
        </main>
    );
}
