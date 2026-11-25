import { useEffect, useRef, useState } from 'react';
import type { MatchingItem, QuestionKind } from './contracts';

export type AnswerValue = string | Record<string, string>;
export type Question = {
    id: string;
    kind: QuestionKind;
    prompt: string;
    options: string[];
    matching?: { left: MatchingItem[]; right: MatchingItem[] };
    value: AnswerValue;
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
    const [value, setValue] = useState<AnswerValue>(q.value);
    const [message, setMessage] = useState('Saved');
    const [retry, setRetry] = useState(0);
    const [saved, setSaved] = useState<AnswerValue>(q.value);
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
                            : response.status === 422
                              ? 'Check the matching selections; each option can be used once.'
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
    const edit = (next: AnswerValue) => {
        setValue(next);
        setMessage(next === saved && !busy ? 'Saved' : 'Unsaved');
    };
    const matching = typeof value === 'object' ? value : {};
    const match = (left: string, right: string) => {
        const next = { ...matching };
        if (right === '') {
            delete next[left];
        } else {
            Object.keys(next).forEach((key) => {
                if (key !== left && next[key] === right) delete next[key];
            });
            next[left] = right;
        }
        edit(next);
    };

    return (
        <section>
            {q.kind === 'matching' && q.matching ? (
                <fieldset>
                    <legend>{q.prompt}</legend>
                    {q.matching.left.map((item) => (
                        <label key={item.id}>
                            {item.label}
                            <select
                                disabled={!active}
                                value={matching[item.id] ?? ''}
                                onChange={(event) => match(item.id, event.target.value)}
                            >
                                <option value="">Select a match</option>
                                {q.matching?.right.map((right) => (
                                    <option
                                        key={right.id}
                                        value={right.id}
                                        disabled={Object.entries(matching).some(([left, selected]) => left !== item.id && selected === right.id)}
                                    >
                                        {right.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    ))}
                </fieldset>
            ) : (
                <label>
                    {q.prompt}
                    {q.options.length ? (
                        <select disabled={!active} value={String(value)} onChange={(event) => edit(event.target.value)}>
                            <option value="">Select an answer</option>
                            {q.options.map((option) => <option key={option}>{option}</option>)}
                        </select>
                    ) : (
                        <textarea disabled={!active} value={String(value)} onChange={(event) => edit(event.target.value)} />
                    )}
                </label>
            )}
            <span role="status">{message}</span>
            {failed && (
                <button onClick={() => {
                    setFailed(false);
                    setRetry((current) => current + 1);
                }}>Retry save</button>
            )}
        </section>
    );
}
