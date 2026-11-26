import { AssessmentWorkspace } from '../../assessment/AssessmentWorkspace';
import { CourseDisclosure } from '@/components/CourseDisclosure';
import { ValidatedInput } from '../../assessment/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Head } from '@inertiajs/react';
import { Post, Field, Check } from '../../assessment/Fields';

type Question = {
    id: string;
    prompt: string;
    answer: string;
    marking_guide: string | null;
    possible: string;
    objective: boolean;
    awarded: string | null;
};
type Revision = {
    revision: number;
    reason: string;
    awards: {
        position: number;
        maximum: string;
        points: string;
    }[];
};

export default function MarkPaper({
    attempt,
    questions,
    revision,
    history,
}: {
    attempt: string;
    questions: Question[];
    revision: number;
    history: Revision[];
}) {
    return (
        <AssessmentWorkspace>
            <Head title="Review examination" />
            <header className="space-y-3 border-b pb-5">
                <p className="text-sm font-medium text-muted-foreground">Marking workspace</p>
                <h1 className="text-3xl font-semibold tracking-tight">Review examination</h1>
                <p>Award points for each written or practical answer. Objective points are included automatically.</p>
            </header>
            <Post key={revision} url={`/attempts/${attempt}/review`} button="Record final mark">
                <input type="hidden" name="base_revision" value={revision} />
                {questions.map((q, i) => (
                    <article key={q.id} className="space-y-3 rounded-xl border p-4">
                        <p className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span className="badge bg-muted">Question {i + 1}</span>
                            {q.objective ? 'Automatic marking' : 'Manual marking'} · {q.possible} points
                        </p>
                        <h2 className="font-semibold">{q.prompt}</h2>
                        <pre className="whitespace-pre-wrap rounded-md bg-muted p-3">{q.answer || 'No response submitted.'}</pre>
                        {q.objective ? (
                            <p>
                                Automatic award: {q.awarded} / {q.possible}
                            </p>
                        ) : (
                            <>
                                {q.marking_guide && <p>Marking guide: {q.marking_guide}</p>}
                                <Label className="grid min-w-0 gap-2 leading-normal">
                                    Question {i + 1} points (out of {q.possible})
                                    <ValidatedInput
                                        type="number"
                                        name={`awards[${q.id}]`}
                                        min="0"
                                        max={q.possible}
                                        defaultValue={q.awarded ?? ''}
                                        step="0.00000001"
                                        required
                                    />
                                </Label>
                            </>
                        )}
                    </article>
                ))}
                <Field name="reason" label="Reason for mark" />
                <Check name="release" label="Return score to learner" />
            </Post>
            {!!history.length && (
                <section className="min-w-0 space-y-3">
                    <h2 className="text-xl font-semibold tracking-tight">Mark history</h2>
                    {history.map((h) => (
                        <CourseDisclosure key={h.revision} label={`Score revision ${h.revision} · ${h.reason}`}>
                            <ol>
                                {h.awards.map((a) => (
                                    <li key={a.position}>
                                        Question {a.position}: {a.points} / {a.maximum}
                                    </li>
                                ))}
                            </ol>
                        </CourseDisclosure>
                    ))}
                </section>
            )}
        </AssessmentWorkspace>
    );
}
