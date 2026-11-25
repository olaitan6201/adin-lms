import '../../assessment/assessment.css';
import { Head } from '@inertiajs/react';
import { useCallback, useState } from 'react';

import { FinalReview } from '../../assessment/FinalReview';
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
    const [progress, setProgress] = useState<Record<string, { dirty: boolean; answered: boolean }>>({});
    const change = useCallback((id: string, dirty: boolean, answered: boolean) => {
        setProgress((previous) => previous[id]?.dirty === dirty && previous[id]?.answered === answered
            ? previous : { ...previous, [id]: { dirty, answered } });
    }, []);
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
                    onProgress={change}
                />
            ))}
            {active && (
                <FinalReview attempt={attempt.id} expires={attempt.expires_at} total={questions.length}
                    pending={questions.some(({ id }) => !progress[id] || progress[id].dirty)}
                    answered={questions.filter(({ id }) => progress[id]?.answered).length} />
            )}
        </main>
    );
}
