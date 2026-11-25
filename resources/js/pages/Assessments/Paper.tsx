import '../../assessment/assessment.css';
import { Head, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

import { Answer, type Question } from '../../assessment/Answer';
import type { AttemptState } from '../../assessment/contracts';

type Props = {
    attempt: {
        id: string;
        state: AttemptState;
        expires_at: string;
    };
    questions: Question[];
    title: string;
};
export default function Paper({ attempt, questions, title }: Props) {
    const [dirty, setDirty] = useState<string[]>([]);
    const change = useCallback(
        (id: string, pending: boolean) =>
            setDirty((ids) =>
                ids.includes(id) === pending
                    ? ids
                    : pending
                      ? [...ids, id]
                      : ids.filter((x) => x !== id),
            ),
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
                Answers save online. Wait for Saved before leaving. This browser cannot prevent other
                apps or verify who is present.
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
                <button
                    disabled={dirty.length > 0}
                    onClick={() => router.post(`/attempts/${attempt.id}/finish`)}
                >
                    Submit final answers
                </button>
            )}
        </main>
    );
}
