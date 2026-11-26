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
export function useAnswerAutosave({
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

    useEffect(() => {
        if (!active || saved === value || busy || failed) {
            return;
        }

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
    useEffect(
        () => onProgress(q.id, saved !== value || busy, answered),
        [q.id, saved, value, busy, answered, onProgress],
    );
    const edit = (next: AnswerValue) => {
        latest.current = next;
        setValue(next);
        setMessage(next === saved && !busy ? 'Saved' : 'Unsaved');
    };

    function retrySave() {
        setFailed(false);
        setRetry((current) => current + 1);
    }
    return { value, edit, message, failed, retrySave };
}
