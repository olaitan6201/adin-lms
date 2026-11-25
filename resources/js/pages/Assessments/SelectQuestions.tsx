import { Head, Link } from '@inertiajs/react';
import { QuestionPicker } from '../../assessment/QuestionPicker';
import type { BankQuestion } from '../../assessment/contracts';

type Props = {
    item: string;
    title: string;
    maximum: string;
    questions: BankQuestion[];
    bank: string;
    topics: { id: string; topic: string }[];
};

export default function SelectQuestions({ item, title, maximum, questions, bank, topics }: Props) {
    return (
        <main className="portal-page mx-auto max-w-4xl space-y-6 px-5 py-10">
            <Head title="Select questions" />
            <nav aria-label="Assessment navigation" className="flex flex-wrap gap-5 underline">
                <Link href={`/courses/${bank.split('/')[2]}/assessments`}>Assessments</Link>
                <Link href={bank}>Question bank</Link>
            </nav>
            <header>
                <p className="portal-kicker">{title}</p>
                <h1 className="portal-title text-3xl font-semibold">Select bank questions</h1>
                <p>
                    Choose fixed revisions or draw unused questions from a topic. The total must equal{' '}
                    {maximum}.
                </p>
            </header>
            <QuestionPicker item={item} maximum={maximum} questions={questions} topics={topics} />
        </main>
    );
}
