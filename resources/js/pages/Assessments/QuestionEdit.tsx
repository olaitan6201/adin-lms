import { Head } from '@inertiajs/react';
import { QuestionForm } from '../../assessment/QuestionForm';
import type { QuestionFormValues } from '../../assessment/contracts';

type Props = {
    offering: string;
    question: string;
    topic: string;
    values: QuestionFormValues;
};

export default function QuestionEdit({ offering, question, topic, values }: Props) {
    const bank = `/courses/${offering}/question-banks`;

    return (
        <main className="mx-auto w-full min-w-0 wrap-anywhere max-w-3xl space-y-6 px-5 py-10">
            <Head title="Edit question" />
            <h1 className="text-3xl font-semibold tracking-tight">Edit question</h1>
            <p>Saving appends a revision; it does not alter questions already fixed to an examination.</p>
            <QuestionForm
                action={`/courses/${offering}/questions/${question}`}
                method="put"
                initial={{ ...values, topic }}
                submitLabel="Save new revision"
                cancelHref={bank}
            />
        </main>
    );
}
