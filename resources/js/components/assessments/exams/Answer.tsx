import { NativeSelectOption } from '@/components/ui/native-select';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { saveAnswer } from './saveAnswer';
import { useEffect, useRef, useState } from 'react';
import type { MatchingItem, QuestionKind } from '@/components/assessments/contracts';

export type AnswerValue = string | Record<string, string>;
export type Question = {
    id: string;
    kind: QuestionKind;
    prompt: string;
    options: string[];
    matching?: {
        left: MatchingItem[];
        right: MatchingItem[];
    };
    value: AnswerValue;
    revision: number;
};

export function Answer({
    question: q,
    url,
    active,
    onProgress,
}: {
    question: Question;
    url: string;
    active: boolean;
    onProgress: (id: string, dirty: boolean, answered: boolean) => void;
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
                const data = await saveAnswer(url, value, revision.current);
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
    const answered = q.matching
        ? typeof saved === 'object' && q.matching.left.every(({ id }) => Boolean(saved[id]))
        : typeof saved === 'string' && saved.trim().length > 0;
    useEffect(() => onProgress(q.id, saved !== value || busy, answered), [q.id, saved, value, busy, answered, onProgress]);
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
        <div className="grid min-w-0 gap-3">
            {q.kind === 'matching' && q.matching ? (
                <fieldset className="grid min-w-0 gap-4 rounded-lg border p-4">
                    <legend className="px-1 text-base font-semibold">{q.prompt}</legend>
                    {q.matching.left.map((item) => (
                        <Label className="grid min-w-0 gap-2 leading-normal" key={item.id}>
                            {item.label}
                            <NativeSelect
                                disabled={!active}
                                value={matching[item.id] ?? ''}
                                onChange={(event) => match(item.id, event.target.value)}
                            >
                                <NativeSelectOption value="">Select a match</NativeSelectOption>
                                {q.matching?.right.map((right) => (
                                    <NativeSelectOption
                                        key={right.id}
                                        value={right.id}
                                        disabled={Object.entries(matching).some(
                                            ([left, selected]) => left !== item.id && selected === right.id,
                                        )}
                                    >
                                        {right.label}
                                    </NativeSelectOption>
                                ))}
                            </NativeSelect>
                        </Label>
                    ))}
                </fieldset>
            ) : q.options.length ? (
                <fieldset className="grid gap-2" disabled={!active}>
                    <legend className="mb-3 font-semibold">{q.prompt}</legend>
                    {q.options.map(option => (
                        <label key={option} className="flex items-start gap-3 rounded-xl border p-3 has-checked:border-brand-700 has-checked:bg-brand-50">
                            <input type="radio" name={`answer-${q.id}`} checked={value === option}
                                className="mt-1 accent-brand-700" onChange={() => edit(option)} />
                            {option}
                        </label>
                    ))}
                    {active && value !== '' && (
                        <button type="button" className="btn btn-ghost justify-self-start" onClick={() => edit('')}>Clear answer</button>
                    )}
                </fieldset>
            ) : (
                <Label className="grid min-w-0 gap-2 leading-normal">
                    {q.prompt}
                    <Textarea className="min-h-36" disabled={!active} value={String(value)}
                        onChange={(event) => edit(event.target.value)} />
                </Label>
            )}
            <span className="text-sm text-muted-foreground" role="status">{message}</span>
            {failed && (
                <Button
                    onClick={() => {
                        setFailed(false);
                        setRetry((current) => current + 1);
                    }}
                >
                    Retry save
                </Button>
            )}
        </div>
    );
}
