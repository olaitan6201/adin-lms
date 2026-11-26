import { CriterionFeedback } from '@/components/assessments/assignments/CriterionFeedback';
import { SubmissionMarkForm, type Rubric } from '@/components/assessments/assignments/SubmissionMarkForm';
import { type SubmissionRow } from './assignmentDetail';
import { AssignmentDownload } from './AssignmentDownload';

export function SubmissionHistory({
    rows,
    url,
    marker,
    rubric,
}: {
    rows: SubmissionRow[];
    url: string;
    marker: boolean;
    rubric: Rubric | null;
}) {
    return (
        <section aria-labelledby="submissions" className="space-y-4">
            <h2 id="submissions" className="scroll-mt-4 text-xl font-semibold tracking-tight">
                Submission history
            </h2>
            {!rows.length && <p>No submissions yet.</p>}
            {rows.map((r) => (
                <article key={r.id} id={`submission-${r.id}`} className="min-w-0 space-y-3 border-t pt-4">
                    <h3 className="font-semibold">
                        Revision {r.revision} · {r.late ? 'Late' : 'On time'}
                    </h3>
                    {marker && <p>Recipients: {r.recipients.join(', ')}</p>}
                    <p>
                        Receipt: <code>{r.receipt}</code>
                    </p>
                    <p className="whitespace-pre-wrap">{r.body}</p>
                    {r.files.map((id) => (
                        <AssignmentDownload key={id} url={url} id={id}>
                            Download submission
                        </AssignmentDownload>
                    ))}
                    {r.scores.map((s) => (
                        <div key={s.id} className="space-y-2 border-l-2 pl-3">
                            Mark: {s.points} · Score revision {s.revision} ·{' '}
                            {s.released_at ? 'Returned' : 'Private draft'}
                            {s.feedback && <p>{s.feedback}</p>}
                            {s.marked_file_id && (
                                <AssignmentDownload key={s.marked_file_id} url={url} id={s.marked_file_id}>
                                    Marked copy
                                </AssignmentDownload>
                            )}
                            <CriterionFeedback scores={s.criteria} />
                        </div>
                    ))}
                    {marker && <SubmissionMarkForm version={r.id} rubric={rubric} />}
                </article>
            ))}
        </section>
    );
}
