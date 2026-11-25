import type { QuestionDetail } from './contracts';

export function QuestionPreviewView({ question }: { question: QuestionDetail }) {
    const matching = question.marking_key.matching;

    return (
        <article className="space-y-4 rounded border p-5">
            <header>
                <p className="portal-kicker">
                    {question.topic} · revision {question.revision}
                </p>
                <h2 className="text-2xl font-semibold">{question.prompt}</h2>
            </header>
            {question.options && (
                <section>
                    <h3 className="font-semibold">Choices</h3>
                    <ul className="list-disc pl-5">
                        {question.options
                            .split('\n')
                            .filter(Boolean)
                            .map((choice) => (
                                <li key={choice}>{choice}</li>
                            ))}
                    </ul>
                </section>
            )}
            {question.accepted && (
                <section>
                    <h3 className="font-semibold">Accepted answers</h3>
                    <p className="whitespace-pre-wrap">{question.accepted}</p>
                </section>
            )}
            {matching && (
                <section>
                    <h3 className="font-semibold">Correct pairs</h3>
                    <ul className="list-disc pl-5">
                        {Object.entries(matching.pairs).map(([left, right]) => (
                            <li key={left}>
                                {matching.left.find((item) => item.id === left)?.label} →{' '}
                                {matching.right.find((item) => item.id === right)?.label}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            {question.guide && (
                <section>
                    <h3 className="font-semibold">Marking guide</h3>
                    <p className="whitespace-pre-wrap">{question.guide}</p>
                </section>
            )}
            <section>
                <h3 className="font-semibold">Revision history</h3>
                <ul className="list-disc pl-5">
                    {question.history.map((version) => (
                        <li key={version.id}>
                            Revision {version.revision}: {version.prompt}
                        </li>
                    ))}
                </ul>
            </section>
        </article>
    );
}
