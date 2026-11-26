import { AssessmentWorkspace } from '@/components/assessments/AssessmentWorkspace';
import { Head, Link } from '@inertiajs/react';
import { QuestionForm } from '@/components/assessments/questions/QuestionForm';
import type { BankQuestion } from '@/components/assessments/contracts';
import { BankFilters, type BankFilterProps } from '@/components/assessments/questions/BankFilters';
import { QuestionRevisions } from '@/components/assessments/questions/QuestionRevisions';

type Props = Omit<BankFilterProps, 'base'> & { offering: string; questions: BankQuestion[] };
export default function QuestionBank({ offering, filters, topics, questions, kinds }: Props) {
    const base = `/courses/${offering}/question-banks`;
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
            <BankFilters base={base} filters={filters} kinds={kinds} topics={topics} />
            <QuestionRevisions offering={offering} questions={questions} />
            <section aria-labelledby="author-title">
                <h2 id="author-title" className="text-xl font-semibold">
                    Author a question
                </h2>
                <QuestionForm action={base} submitLabel="Create question" cancelHref={base} />
            </section>
        </AssessmentWorkspace>
    );
}
