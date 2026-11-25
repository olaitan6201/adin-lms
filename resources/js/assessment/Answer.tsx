import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { saveAnswer } from './saveAnswer';
import { useEffect, useRef, useState } from 'react';
import type { MatchingItem, QuestionKind } from './contracts';

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
        <Card>
            <CardContent className="grid min-w-0 gap-3">
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
                                    <option value="">Select a match</option>
                                    {q.matching?.right.map((right) => (
                                        <option
                                            key={right.id}
                                            value={right.id}
                                            disabled={Object.entries(matching).some(
                                                ([left, selected]) => left !== item.id && selected === right.id,
                                            )}
                                        >
                                            {right.label}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </Label>
                        ))}
                    </fieldset>
                ) : (
                    <Label className="grid min-w-0 gap-2 leading-normal">
                        {q.prompt}
                        {q.options.length ? (
                            <NativeSelect disabled={!active} value={String(value)} onChange={(event) => edit(event.target.value)}>
                                <option value="">Select an answer</option>
                                {q.options.map((option) => (
                                    <option key={option}>{option}</option>
                                ))}
                            </NativeSelect>
                        ) : (
                            <Textarea
                                disabled={!active}
                                value={String(value)}
                                onChange={(event) => edit(event.target.value)}
                            />
                        )}
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
            </CardContent>
        </Card>
    );
}
