import { Input } from '@/components/ui/input';
import '../../assessment/assessment.css';
import { Head } from '@inertiajs/react';
import { Post, Field, Check } from '../../assessment/Fields';

type Question = {
    id: string;
    prompt: string;
    answer: string;
    marking_guide: string | null;
    possible: string;
    objective: boolean;
    awarded: string | null;
};
type Revision = {
    revision: number;
    reason: string;
    awards: {
        position: number;
        maximum: string;
        points: string;
    }[];
};

export default function MarkPaper({
    attempt,
    questions,
    revision,
    history,
}: {
    attempt: string;
    questions: Question[];
    revision: number;
    history: Revision[];
}) {
    return (
        <main className="portal-page assessment-page">
            <Head title="Review examination" />
            <header className="assessment-heading">
                <p className="portal-kicker">Marking workspace</p>
                <h1 className="portal-title">Review examination</h1>
                <p>Award points for each written or practical answer. Objective points are included automatically.</p>
            </header>
            <Post key={revision} url={`/attempts/${attempt}/review`} button="Record final mark">
                <input type="hidden" name="base_revision" value={revision} />
                {questions.map((q, i) => (
                    <article key={q.id}>
                        <h2>
                            Question {i + 1} · {q.prompt}
                        </h2>
                        <pre>{q.answer || 'No response submitted.'}</pre>
                        {q.objective ? (
                            <p>
                                Automatic award: {q.awarded} / {q.possible}
                            </p>
                        ) : (
                            <>
                                {q.marking_guide && <p>Marking guide: {q.marking_guide}</p>}
                                <label>
                                    Question {i + 1} points (out of {q.possible})
                                    <Input
                                        type="number"
                                        name={`awards[${q.id}]`}
                                        min="0"
                                        max={q.possible}
                                        defaultValue={q.awarded ?? ''}
                                        step="0.00000001"
                                        required
                                    />
                                </label>
                            </>
                        )}
                    </article>
                ))}
                <Field name="reason" label="Reason for mark" />
                <Check name="release" label="Return score to learner" />
            </Post>
            {!!history.length && (
                <section>
                    <h2>Mark history</h2>
                    {history.map((h) => (
                        <details key={h.revision}>
                            <summary>
                                Score revision {h.revision} · {h.reason}
                            </summary>
                            <ol>
                                {h.awards.map((a) => (
                                    <li key={a.position}>
                                        Question {a.position}: {a.points} / {a.maximum}
                                    </li>
                                ))}
                            </ol>
                        </details>
                    ))}
                </section>
            )}
        </main>
    );
}
