import '../../assessment/assessment.css';
import { Head, router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

import { Answer, type Question } from '../../assessment/Answer';
import type { AttemptState } from '../../assessment/contracts';
import { IntegrityNotice, type IntegrityPolicy } from '../../assessment/IntegrityNotice';

type Props = {
    attempt: {
        id: string;
        state: AttemptState;
        expires_at: string;
    };
    questions: Question[];
    title: string;
    integrity: IntegrityPolicy;
};
export default function Paper({ attempt, questions, title, integrity }: Props) {
    const [dirty, setDirty] = useState<string[]>([]);
    const change = useCallback(
        (id: string, pending: boolean) =>
            setDirty((ids) =>
                ids.includes(id) === pending ? ids : pending ? [...ids, id] : ids.filter((x) => x !== id),
            ),
        [],
    );
    const active = attempt.state === 'active';

    return (
        <main
            className="portal-page assessment-page"
            onCopy={(event) => {
                if (active && integrity.prevent_copy) event.preventDefault();
            }}
        >
            <Head title={title} />
            <p className="portal-kicker">Examination paper</p>
            <h1 className="portal-title">{title}</h1>
            <p>
                Status: {attempt.state} · Deadline: {new Date(attempt.expires_at).toLocaleString()}
            </p>
            <p>Answers save online. Wait for Saved before leaving.</p>
            <IntegrityNotice policy={integrity} active={active} attempt={attempt.id} />
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
