import { AssessmentWorkspace } from '@/components/assessments/AssessmentWorkspace';
import { Head, Link } from '@inertiajs/react';
import { QuestionPicker } from '@/components/assessments/questions/QuestionPicker';
import type { BankQuestion } from '@/components/assessments/contracts';

type Props = {
    item: string;
    title: string;
    maximum: string;
    questions: BankQuestion[];
    bank: string;
    topics: {
        id: string;
        topic: string;
    }[];
};

export default function SelectQuestions({ item, title, maximum, questions, bank, topics }: Props) {
    return (
        <AssessmentWorkspace>
            <Head title="Select questions" />
            <nav aria-label="Assessment navigation" className="flex flex-wrap gap-5 underline">
                <Link
                    className="text-primary underline underline-offset-4"
                    href={`/courses/${bank.split('/')[2]}/assessments`}
                >
                    Assessments
                </Link>
                <Link className="text-primary underline underline-offset-4" href={bank}>
                    Question bank
                </Link>
            </nav>
            <header>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <h1 className="text-3xl font-semibold tracking-tight">Select bank questions</h1>
                <p>
                    Choose fixed revisions or draw unused questions from a topic. The total must equal{' '}
                    {maximum}.
                </p>
            </header>
            <dl className="grid grid-cols-2 gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-3">
                {[
                    ['Available revisions', questions.length],
                    ['Draw topics', topics.length],
                    ['Required points', maximum],
                ].map(([label, value]) => (
                    <div key={label}>
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="mt-1 font-mono text-lg">{value}</dd>
                    </div>
                ))}
            </dl>
            <QuestionPicker item={item} maximum={maximum} questions={questions} topics={topics} />
        </AssessmentWorkspace>
    );
}
