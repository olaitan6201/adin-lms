import { Head, Link } from '@inertiajs/react';
import { QuestionPreviewView } from '../../assessment/QuestionPreviewView';
import type { QuestionDetail } from '../../assessment/contracts';

export default function QuestionPreview({ offering, question }: { offering: string; question: QuestionDetail }) {
    const bank = `/courses/${offering}/question-banks`;

    return (
        <main className="portal-page mx-auto max-w-3xl space-y-6 px-5 py-10">
            <Head title="Question preview" />
            <nav aria-label="Question navigation" className="flex flex-wrap gap-5 underline">
                <Link href={bank}>Question bank</Link>
                <Link href={`/courses/${offering}/questions/${question.question_id}/edit`}>Edit as new revision</Link>
            </nav>
            <h1 className="portal-title text-3xl font-semibold">Author preview</h1>
            <p>Marking information is visible only to authorised question authors.</p>
            <QuestionPreviewView question={question} />
        </main>
    );
}
