import { Head, Link } from '@inertiajs/react';
import { QuestionForm } from '../../assessment/QuestionForm';
import type { BankQuestion } from '../../assessment/contracts';

type Props = {
    offering: string;
    filters: { q?: string; kind?: string; topic?: string };
    topics: string[];
    questions: BankQuestion[];
    kinds: string[];
};

export default function QuestionBank({ offering, filters, topics, questions, kinds }: Props) {
    const base = `/courses/${offering}/question-banks`;
    const groups = questions.reduce<Record<string, BankQuestion[]>>((result, question) => {
        (result[question.topic] ??= []).push(question);
        return result;
    }, {});

    return (
        <main className="portal-page mx-auto max-w-4xl space-y-6 px-5 py-10">
            <Head title="Question bank" />
            <nav aria-label="Assessment navigation" className="flex flex-wrap gap-5 underline">
                <Link href={`/courses/${offering}/assessments`}>Assessments</Link>
                <Link href={base} aria-current="page">Question bank</Link>
            </nav>
            <header>
                <p className="portal-kicker">Course assessment authoring</p>
                <h1 className="portal-title text-3xl font-semibold">Question bank</h1>
                <p>Edits create a new revision. Existing examination papers keep their fixed versions.</p>
            </header>
            <form action={base} method="get" className="grid gap-3 rounded border p-4 sm:grid-cols-3">
                <label>
                    Search prompts
                    <input name="q" defaultValue={filters.q} className="block w-full rounded border p-2" />
                </label>
                <label>
                    Type
                    <select name="kind" defaultValue={filters.kind ?? ''} className="block w-full rounded border p-2">
                        <option value="">All types</option>
                        {kinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
                    </select>
                </label>
                <label>
                    Topic
                    <select name="topic" defaultValue={filters.topic ?? ''} className="block w-full rounded border p-2">
                        <option value="">All topics</option>
                        {topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
                    </select>
                </label>
                <button className="justify-self-start rounded bg-teal-900 px-4 py-2 text-white">Filter questions</button>
            </form>
            <section aria-labelledby="browse-title">
                <h2 id="browse-title" className="text-xl font-semibold">Browse latest revisions</h2>
                {!questions.length && <p>No questions match these filters.</p>}
                {Object.entries(groups).map(([topic, entries]) => (
                    <section key={topic} className="mt-5">
                        <h3 className="text-lg font-semibold">{topic}</h3>
                        {entries.map((question) => (
                            <article key={question.id} className="space-y-2 border-b py-4">
                                <p className="portal-kicker">{question.kind} · revision {question.revision}</p>
                                <p className="whitespace-pre-wrap">{question.prompt}</p>
                                <div className="flex flex-wrap gap-5">
                                    <Link href={`/courses/${offering}/questions/${question.question_id}`} className="underline">Preview</Link>
                                    <Link href={`/courses/${offering}/questions/${question.question_id}/edit`} className="underline">Edit as new revision</Link>
                                </div>
                            </article>
                        ))}
                    </section>
                ))}
            </section>
            <section aria-labelledby="author-title">
                <h2 id="author-title" className="text-xl font-semibold">Author a question</h2>
                <QuestionForm action={base} submitLabel="Create question" cancelHref={base} />
            </section>
        </main>
    );
}
