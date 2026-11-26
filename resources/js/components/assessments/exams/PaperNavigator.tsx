import { useEffect, useState } from 'react';
import type { Question } from './Answer';

type Props = {
    expires: string;
    active: boolean;
    questions: Question[];
    progress: Record<string, { answered: boolean; dirty: boolean }>;
};

function RemainingTime({ expires }: { expires: string }) {
    const [now, setNow] = useState(Date.now);
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);
    const seconds = Math.max(0, Math.ceil((Date.parse(expires) - now) / 1000));

    return (
        <div className="rounded-xl bg-slate-900 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider">Time remaining</p>
            <p role="timer" className="mt-1 font-mono text-3xl tabular-nums">
                {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
            </p>
        </div>
    );
}

export function PaperNavigator({ expires, active, questions, progress }: Props) {
    return (
        <>
            <section className="assessment-panel">
                <h2 className="font-semibold">Access window</h2>
                {active && <RemainingTime expires={expires} />}
                <p className="mt-3">
                    Deadline: <time dateTime={expires}>{new Date(expires).toLocaleString()}</time>
                </p>
            </section>
            <nav aria-label="Question palette" className="assessment-panel question-palette">
                <h2 className="font-semibold">Question palette</h2>
                <p>
                    Saved answers: {questions.filter((q) => progress[q.id]?.answered).length} of{' '}
                    {questions.length}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {questions.map(({ id }, i) => {
                        const answered = progress[id]?.answered;
                        return (
                            <a
                                key={id}
                                href={`#question-${id}`}
                                aria-label={`Question ${i + 1}, ${answered ? 'answered' : 'unanswered'}`}
                                className={`inline-flex min-h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-1 font-semibold ${answered ? 'bg-brand-700 text-white' : 'bg-card'}`}
                            >
                                {i + 1}
                                {answered && <span aria-hidden="true">✓</span>}
                            </a>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
