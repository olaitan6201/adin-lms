import { AssessmentWorkspace } from '@/components/assessments/AssessmentWorkspace';
import { Head } from '@inertiajs/react';
import { useCallback, useState } from 'react';

import { FinalReview } from '@/components/assessments/exams/FinalReview';
import { PaperNavigator } from '@/components/assessments/exams/PaperNavigator';
import { Answer, type Question } from '@/components/assessments/exams/Answer';
import type { AttemptState } from '@/components/assessments/contracts';
import { IntegrityNotice, type IntegrityPolicy } from '@/components/assessments/exams/IntegrityNotice';

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
        <AssessmentWorkspace
            onCopy={(event) => {
                if (active && integrity.prevent_copy) event.preventDefault();
            }}
        >
            <Head title={title} />
            <header className="space-y-2 border-b pb-5">
                <p className="text-sm font-medium text-muted-foreground">Examination paper</p>
                <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                <p>Status: {attempt.state}</p>
                <p>Answers save online. Wait for Saved before leaving.</p>
            </header>
            <div className="assessment-split">
                <div className="space-y-5">
                    <PaperNavigator active={active} expires={attempt.expires_at} questions={questions} progress={progress} />
                    <IntegrityNotice policy={integrity} active={active} attempt={attempt.id} />
                </div>
                <div className="space-y-5">
                    {questions.map((q, i) => (
                        <section key={q.id} id={`question-${q.id}`} tabIndex={-1} className="assessment-panel scroll-mt-6">
                            <h2 className="font-semibold">Question {i + 1} · {q.kind.replaceAll('_', ' ')}</h2>
                            <Answer question={q} url={`/attempts/${attempt.id}/answers/${q.id}`} active={active} onProgress={change} />
                        </section>
                    ))}
                </div>
            </div>
            {active && (
                <FinalReview attempt={attempt.id} expires={attempt.expires_at} total={questions.length}
                    pending={questions.some(({ id }) => !progress[id] || progress[id].dirty)}
                    answered={questions.filter(({ id }) => progress[id]?.answered).length} />
            )}
        </AssessmentWorkspace>
    );
}
