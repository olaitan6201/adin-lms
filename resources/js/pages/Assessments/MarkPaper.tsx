import '../../assessment/assessment.css';
import { Post, Field, Check } from '../../assessment/Fields';
export default function MarkPaper({
    attempt,
    questions,
}: {
    attempt: string;
    questions: {
        prompt: string;
        answer: string;
        possible: string;
        automatic: string | null;
    }[];
}) {
    return (
        <main className="assessment-page">
            <h1>Review examination</h1>
            {questions.map((q, i) => (
                <article key={i}>
                    <h2>{q.prompt}</h2>
                    <pre>{q.answer}</pre>
                    <p>
                        {q.automatic ?? 'Requires manual review'} / {q.possible}
                    </p>
                </article>
            ))}
            <Post url={`/attempts/${attempt}/review`} button="Record final mark">
                <Field type="number" label="Final points" name="points" />
                <Field name="reason" label="Reason for mark" />
                <Check name="release" label="Return score to learner" />
            </Post>
        </main>
    );
}
