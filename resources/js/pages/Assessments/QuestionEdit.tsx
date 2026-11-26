import { AssessmentWorkspace } from '@/components/assessments/AssessmentWorkspace';
import { Head } from '@inertiajs/react';
import { QuestionForm } from '@/components/assessments/questions/QuestionForm';
import type { QuestionFormValues } from '@/components/assessments/contracts';

type Props = {
    offering: string;
    question: string;
    topic: string;
    values: QuestionFormValues;
};

export default function QuestionEdit({ offering, question, topic, values }: Props) {
    const bank = `/courses/${offering}/question-banks`;

    return (
        <AssessmentWorkspace>
            <Head title="Edit question" />
            <header>
                <p>Question bank · {topic}</p>
                <h1 className="font-semibold">Edit question</h1>
                <p>Saving appends a revision; it does not alter questions already fixed to an examination.</p>
            </header>
            <QuestionForm
                action={`/courses/${offering}/questions/${question}`}
                method="put"
                initial={{ ...values, topic }}
                submitLabel="Save new revision"
                cancelHref={bank}
            />
        </AssessmentWorkspace>
    );
}
