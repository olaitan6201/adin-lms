import { AssessmentWorkspace } from '@/components/assessments/AssessmentWorkspace';
import { Head, Link } from '@inertiajs/react';
import { QuestionPreviewView } from '@/components/assessments/questions/QuestionPreviewView';
import type { QuestionDetail } from '@/components/assessments/contracts';

type QuestionPreviewProps = {
    offering: string;
    question: QuestionDetail;
};

export default function QuestionPreview({ offering, question }: QuestionPreviewProps) {
    const bank = `/courses/${offering}/question-banks`;

    return (
        <AssessmentWorkspace>
            <Head title="Question preview" />
            <nav aria-label="Question navigation" className="flex flex-wrap gap-5 underline">
                <Link className="text-primary underline underline-offset-4" href={bank}>
                    Question bank
                </Link>
                <Link
                    className="text-primary underline underline-offset-4"
                    href={`/courses/${offering}/questions/${question.question_id}/edit`}
                >
                    Edit as new revision
                </Link>
            </nav>
            <header>
                <p>Question bank · Revision {question.revision}</p>
                <h1 className="font-semibold">Author preview</h1>
                <p>Marking information is visible only to authorised question authors.</p>
            </header>
            <QuestionPreviewView question={question} />
        </AssessmentWorkspace>
    );
}
