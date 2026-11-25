import '../../assessment/assessment.css';
import { Head } from '@inertiajs/react';
import { AssignmentLimits } from '../../assessment/AssignmentLimits';
import { SubmissionEntry } from '../../assessment/SubmissionEntry';
import { SubmissionMarkForm, type Rubric } from '../../assessment/SubmissionMarkForm';

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
        criteria: {
            criterion_title: string;
            level_label: string;
            points: string;
            feedback: string | null;
        }[];
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
    const url = `/assignments/${a.id}`;
    const download = (id: string, text: string) => (
        <a key={id} href={`${url}/files/${id}`}>
            {text}
        </a>
    );

    return (
        <main className="portal-page assessment-page">
            <Head title={title} />
            <header className="assessment-heading">
                <p className="portal-kicker">
                    {marker ? 'Marking workspace' : a.group_work ? 'Group assignment' : 'Individual assignment'}
                </p>
                <h1 className="portal-title">{title}</h1>
                <nav aria-label="Assignment sections">
                    <a href="#submissions">Submission history</a>
                </nav>
            </header>
            <section aria-label="Assignment brief">
                <h2>Assignment brief</h2>
                <p className="assessment-prose">{a.instructions}</p>
                <a href={`${url}/instructions`}>Download instructions (.txt)</a>
                <AssignmentLimits assignment={a} />
                {references.map((id) => download(id, 'Download reference'))}
                {rubric && (rubric.guide || rubric.criteria?.length) ? (
                    <details>
                        <summary>Marking criteria</summary>
                        <p>{rubric.guide}</p>
                        {rubric.criteria?.map((c) => (
                            <div key={c.id}>
                                <h3>{c.title}</h3>
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
                    </details>
                ) : null}
                <p>
                    {a.editable ? 'Revisions accepted.' : 'One submission only.'}{' '}
                    {a.late_policy.allow ? 'Late work accepted until close.' : 'No late submissions.'}
                </p>
            </section>
            {!marker && (
                <SubmissionEntry url={url} formats={a.accepted_formats} groupWork={a.group_work} groups={groups} />
            )}
            {marker && (
                <section>
                    <h2>Pending submissions</h2>
                    <p>{pending.length ? pending.join(', ') : 'All learners have submitted.'}</p>
                </section>
            )}
            <h2 id="submissions">Submission history</h2>
            {!rows.length && <p>No submissions yet.</p>}
            {rows.map((r) => (
                <article key={r.id} id={`submission-${r.id}`}>
                    <h3>
                        Revision {r.revision} · {r.late ? 'Late' : 'On time'}
                    </h3>
                    {marker && <p>Recipients: {r.recipients.join(', ')}</p>}
                    <p>Receipt: <code>{r.receipt}</code></p>
                    <p>{r.body}</p>
                    {r.files.map((id) => download(id, 'Download submission'))}
                    {r.scores.map((s) => (
                        <div key={s.id}>
                            Mark: {s.points} · Score revision {s.revision} ·{' '}
                            {s.released_at ? 'Returned' : 'Private draft'}
                            {s.feedback && <p>{s.feedback}</p>}
                            {s.marked_file_id && download(s.marked_file_id, 'Marked copy')}
                            <ul>
                                {s.criteria.map((c, i) => (
                                    <li key={i}>
                                        <strong>{c.criterion_title}</strong>: {c.level_label} · {c.points} points.{' '}
                                        {c.feedback}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    {marker && <SubmissionMarkForm version={r.id} rubric={rubric} />}
                </article>
            ))}
        </main>
    );
}
