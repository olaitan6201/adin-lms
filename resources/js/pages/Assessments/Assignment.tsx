import { AssessmentWorkspace } from '@/components/assessments/AssessmentWorkspace';
import { CourseDisclosure } from '@/components/learning/CourseDisclosure';
import { CriterionFeedback, type CriterionScore } from '@/components/assessments/assignments/CriterionFeedback';
import { Head } from '@inertiajs/react';
import { AssignmentLimits } from '@/components/assessments/assignments/AssignmentLimits';
import { SubmissionEntry } from '@/components/assessments/assignments/SubmissionEntry';
import { SubmissionMarkForm, type Rubric } from '@/components/assessments/assignments/SubmissionMarkForm';

type Row = {
    recipients: string[];
    id: string;
    revision: number;
    body: string | null;
    receipt: string;
    late: boolean;
    files: string[];
    scores: {
        id: string;
        points: string;
        feedback: string | null;
        marked_file_id: string | null;
        revision: number;
        released_at: string | null;
        criteria: CriterionScore[];
    }[];
};
type Props = {
    pending: string[];
    assignment: {
        id: string;
        instructions: string;
        group_work: boolean;
        opens_at: string;
        due_at: string;
        closes_at: string;
        accepted_formats: string[];
        max_bytes: number;
        editable: boolean;
        late_policy: { allow: boolean };
    };
    title: string;
    rubric: Rubric | null;
    marker: boolean;
    rows: Row[];
    groups: {
        id: string;
        name: string;
    }[];
    references: string[];
};

export default function Assignment({ assignment: a, title, rubric, marker, rows, groups, references, pending }: Props) {
    const individualSubmissionComplete = !a.group_work && !a.editable && rows.length > 0;
    const url = `/assignments/${a.id}`;
    const download = (id: string, text: string) => (
        <a className="block w-fit text-primary underline underline-offset-4" key={id} href={`${url}/files/${id}`}>
            {text}
        </a>
    );

    return (
        <AssessmentWorkspace>
            <Head title={title} />
            <header className="space-y-3 border-b pb-5">
                <p className="text-sm font-medium text-muted-foreground">
                    {marker ? 'Marking workspace' : a.group_work ? 'Group assignment' : 'Individual assignment'}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
                <nav aria-label="Assignment sections" className="flex flex-wrap gap-x-5 gap-y-2">
                    <a className="text-primary underline underline-offset-4" href="#submissions">Submission history</a>
                </nav>
            </header>
            <div className="grid items-start gap-5 xl:grid-cols-2">
                <section aria-label="Assignment brief" className="assessment-panel space-y-3">
                    <h2 className="text-xl font-semibold tracking-tight">Assignment brief</h2>
                    <p className="max-w-prose whitespace-pre-wrap">{a.instructions}</p>
                    <a className="text-primary underline underline-offset-4" href={`${url}/instructions`}>Download instructions (.txt)</a>
                    <AssignmentLimits assignment={a} />
                    {references.map((id) => download(id, 'Download reference'))}
                    {rubric && (rubric.guide || rubric.criteria?.length) ? (
                        <CourseDisclosure label="Marking criteria">
                            <p>{rubric.guide}</p>
                            {rubric.criteria?.map((c) => (
                                <div key={c.id}>
                                    <h3 className="font-semibold">{c.title}</h3>
                                    <p>{c.description}</p>
                                    <ul>
                                        {c.levels.map((l) => (
                                            <li key={l.id}>
                                                {l.label}: {l.points} points. {l.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </CourseDisclosure>
                    ) : null}
                    <p>
                        {a.editable ? 'Revisions accepted.' : 'One submission only.'}{' '}
                        {a.late_policy.allow ? 'Late work accepted until close.' : 'No late submissions.'}
                    </p>
                </section>
                <div className="assessment-panel">
                    {!marker && individualSubmissionComplete && (
                        <section aria-label="Submission received" className="space-y-2 rounded-md bg-muted p-4">
                            <h2 className="text-xl font-semibold tracking-tight">Your submission</h2>
                            <p role="status">Revision received. <a className="text-primary underline underline-offset-4" href="#submissions">View submission history</a></p>
                            <p>This assignment accepts one submission.</p>
                        </section>
                    )}
                    {!marker && !individualSubmissionComplete && (
                        <SubmissionEntry url={url} formats={a.accepted_formats} groupWork={a.group_work} groups={groups} />
                    )}
                    {marker && (
                        <section className="min-w-0 space-y-3">
                            <h2 className="text-xl font-semibold tracking-tight">Pending submissions</h2>
                            <p>{pending.length ? pending.join(', ') : 'All learners have submitted.'}</p>
                        </section>
                    )}
                </div>
            </div>
            <section aria-labelledby="submissions" className="space-y-4">
                <h2 id="submissions" className="scroll-mt-4 text-xl font-semibold tracking-tight">Submission history</h2>
                {!rows.length && <p>No submissions yet.</p>}
                {rows.map((r) => (
                    <article key={r.id} id={`submission-${r.id}`} className="min-w-0 space-y-3 border-t pt-4">
                        <h3 className="font-semibold">
                            Revision {r.revision} · {r.late ? 'Late' : 'On time'}
                        </h3>
                        {marker && <p>Recipients: {r.recipients.join(', ')}</p>}
                        <p>Receipt: <code>{r.receipt}</code></p>
                        <p className="whitespace-pre-wrap">{r.body}</p>
                        {r.files.map((id) => download(id, 'Download submission'))}
                        {r.scores.map((s) => (
                            <div key={s.id} className="space-y-2 border-l-2 pl-3">
                                Mark: {s.points} · Score revision {s.revision} ·{' '}
                                {s.released_at ? 'Returned' : 'Private draft'}
                                {s.feedback && <p>{s.feedback}</p>}
                                {s.marked_file_id && download(s.marked_file_id, 'Marked copy')}
                                <CriterionFeedback scores={s.criteria} />
                            </div>
                        ))}
                        {marker && <SubmissionMarkForm version={r.id} rubric={rubric} />}
                    </article>
                ))}
            </section>
        </AssessmentWorkspace>
    );
}
