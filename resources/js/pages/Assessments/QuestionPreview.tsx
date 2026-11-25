import { Head, Link } from '@inertiajs/react';
import { QuestionPreviewView } from '../../assessment/QuestionPreviewView';
import type { QuestionDetail } from '../../assessment/contracts';

type QuestionPreviewProps = {
    offering: string;
    question: QuestionDetail;
};

export default function QuestionPreview({ offering, question }: QuestionPreviewProps) {
    const bank = `/courses/${offering}/question-banks`;

    return (
        <main className="mx-auto w-full min-w-0 wrap-anywhere max-w-3xl space-y-6 px-5 py-10">
            <Head title="Question preview" />
            <nav aria-label="Question navigation" className="flex flex-wrap gap-5 underline">
                <Link className="text-primary underline underline-offset-4" href={bank}>Question bank</Link>
                <Link className="text-primary underline underline-offset-4" href={`/courses/${offering}/questions/${question.question_id}/edit`}>Edit as new revision</Link>
            </nav>
            <h1 className="text-3xl font-semibold tracking-tight">Author preview</h1>
            <p>Marking information is visible only to authorised question authors.</p>
            <QuestionPreviewView question={question} />
        </main>
    );
}
