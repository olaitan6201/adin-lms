import { Link } from '@inertiajs/react';
import type { BankQuestion } from '@/components/assessments/contracts';

export function QuestionRevisions({ offering, questions }: { offering: string; questions: BankQuestion[] }) {
    const groups = questions.reduce<Record<string, BankQuestion[]>>((result, question) => {
        (result[question.topic] ??= []).push(question);
        return result;
    }, {});

    return (
        <section aria-labelledby="browse-title">
            <h2 id="browse-title" className="text-xl font-semibold">
                Browse latest revisions
            </h2>
            {!questions.length && <p>No questions match these filters.</p>}
            {Object.entries(groups).map(([topic, entries]) => (
                <section key={topic} className="mt-5">
                    <h3 className="text-lg font-semibold">{topic}</h3>
                    {entries.map((question) => (
                        <article key={question.id} className="space-y-2 border-b py-4">
                            <p className="text-sm font-medium text-muted-foreground">
                                {question.kind} · revision {question.revision}
                            </p>
                            <p className="whitespace-pre-wrap">{question.prompt}</p>
                            <div className="flex flex-wrap gap-5">
                                <Link
                                    href={`/courses/${offering}/questions/${question.question_id}`}
                                    className="underline"
                                >
                                    Preview
                                </Link>
                                <Link
                                    href={`/courses/${offering}/questions/${question.question_id}/edit`}
                                    className="underline"
                                >
                                    Edit as new revision
                                </Link>
                            </div>
                        </article>
                    ))}
                </section>
            ))}
        </section>
    );
}
