import '../../assessment/assessment.css';
import { Form, Head } from '@inertiajs/react';

type Row = {
    recipients: string[];
    id: string;
    revision: number;
    body: string | null;
    receipt: string;
    late: boolean;
    files: string[];
    scores: { id: string; points: string; feedback: string | null; marked_file_id: string | null }[];
};
type Props = {
    pending: string[];
    assignment: { id: string; instructions: string; group_work: boolean; due_at: string; closes_at: string };
    title: string;
    marker: boolean;
    rows: Row[];
    groups: { id: string; name: string }[];
    references: string[];
};
export default function Assignment({ assignment: a, title, marker, rows, groups, references, pending }: Props) {
    const url = `/assignments/${a.id}`;
    const download = (id: string, text: string) => (
        <a key={id} href={`${url}/files/${id}`}>
            {text}
        </a>
    );
    return (
        <main className="assessment-page">
            <Head title={title} />
            <h1>{title}</h1>
            <p>{a.instructions}</p>
            <p>
                Due {new Date(a.due_at).toLocaleString()} · Closes {new Date(a.closes_at).toLocaleString()}
            </p>
            {references.map((id) => download(id, 'Download reference'))}
            {!marker && (
                <Form action={url} method="post">
                    {({ processing, errors }) => (
                        <>
                            <label>
                                Answer
                                <textarea name="body" />
                            </label>
                            <label>
                                Attach PDF or text
                                <input type="file" name="script" accept=".pdf,.txt" />
                            </label>
                            {a.group_work && (
                                <label>
                                    Study group
                                    <select name="group_id" required>
                                        {groups.map((g) => (
                                            <option value={g.id} key={g.id}>
                                                {g.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            )}
                            <button disabled={processing}>Submit revision</button>
                            <p role="alert">{Object.values(errors).join(' ')}</p>
                        </>
                    )}
                </Form>
            )}
            {marker && (
                <section>
                    <h2>Pending submissions</h2>
                    <p>{pending.length ? pending.join(', ') : 'All learners have submitted.'}</p>
                </section>
            )}
            <h2>Submission history</h2>
            {!rows.length && <p>No submissions yet.</p>}
            {rows.map((r) => (
                <article key={r.id}>
                    <h3>
                        Revision {r.revision} · {r.late ? 'Late' : 'On time'}
                    </h3>
                    {marker && <p>Recipients: {r.recipients.join(', ')}</p>}
                    <p>Receipt: {r.receipt}</p>
                    <p>{r.body}</p>
                    {r.files.map((id) => download(id, 'Download submission'))}
                    {r.scores.map((s) => (
                        <p key={s.id}>
                            Mark: {s.points} · {s.feedback} {s.marked_file_id && download(s.marked_file_id, 'Marked copy')}
                        </p>
                    ))}
                    {marker && (
                        <Form action={`/submission-versions/${r.id}/marks`} method="post">
                            {({ processing, errors }) => (
                                <>
                                    <label>
                                        Points
                                        <input required name="points" type="number" min="0" step="any" />
                                    </label>
                                    <label>
                                        Feedback
                                        <textarea name="feedback" />
                                    </label>
                                    <label>
                                        Reason
                                        <input name="reason" required />
                                    </label>
                                    <label>
                                        Marked copy
                                        <input type="file" name="script" accept=".pdf,.txt" />
                                    </label>
                                    <label>
                                        <input type="checkbox" name="release" value="1" />
                                        Return to recipients
                                    </label>
                                    <button disabled={processing}>Record mark</button>
                                    <p role="alert">{Object.values(errors).join(' ')}</p>
                                </>
                            )}
                        </Form>
                    )}
                </article>
            ))}
        </main>
    );
}
