import { AssessmentWorkspace } from '@/components/assessments/AssessmentWorkspace';
import { NativeSelectOption } from '@/components/ui/native-select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { QuestionForm } from '@/components/assessments/questions/QuestionForm';
import type { BankQuestion } from '@/components/assessments/contracts';

type Props = {
    offering: string;
    filters: {
        q?: string;
        kind?: string;
        topic?: string;
    };
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
        <AssessmentWorkspace>
            <Head title="Question bank" />
            <nav aria-label="Assessment navigation" className="flex flex-wrap gap-5 underline">
                <Link href={`/courses/${offering}/assessments`}>Assessments</Link>
                <Link href={base} aria-current="page">
                    Question bank
                </Link>
                <a href="#author-title">Author a question</a>
            </nav>
            <header>
                <p className="text-sm font-medium text-muted-foreground">Course assessment authoring</p>
                <h1 className="text-3xl font-semibold tracking-tight">Question bank</h1>
                <p>Edits create a new revision. Existing examination papers keep their fixed versions.</p>
            </header>
            <form action={base} method="get" className="grid gap-3 rounded border p-4 sm:grid-cols-3">
                <Label className="grid min-w-0 gap-2 leading-normal">
                    Search prompts
                    <Input name="q" defaultValue={filters.q} />
                </Label>
                <Label className="grid min-w-0 gap-2 leading-normal">
                    Type
                    <NativeSelect name="kind" defaultValue={filters.kind ?? ''}>
                        <NativeSelectOption value="">All types</NativeSelectOption>
                        {kinds.map((kind) => (
                            <NativeSelectOption key={kind} value={kind}>
                                {kind}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                </Label>
                <Label className="grid min-w-0 gap-2 leading-normal">
                    Topic
                    <NativeSelect name="topic" defaultValue={filters.topic ?? ''}>
                        <NativeSelectOption value="">All topics</NativeSelectOption>
                        {topics.map((topic) => (
                            <NativeSelectOption key={topic} value={topic}>
                                {topic}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                </Label>
                <Button type="submit" className="justify-self-start">
                    Filter questions
                </Button>
            </form>
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
            <section aria-labelledby="author-title">
                <h2 id="author-title" className="text-xl font-semibold">
                    Author a question
                </h2>
                <QuestionForm action={base} submitLabel="Create question" cancelHref={base} />
            </section>
        </AssessmentWorkspace>
    );
}
