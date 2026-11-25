import { Head, Link } from '@inertiajs/react';
import { Post } from '../../assessment/Fields';
import type { IntegrityPolicy } from '../../assessment/IntegrityNotice';
import '../../assessment/assessment.css';

type Signal = {
    id: string;
    learner: string;
    ordinal: number;
    at: string;
    note: string | null;
    reviewer: string | null;
};
type Props = {
    exam: string;
    title: string;
    policy: IntegrityPolicy;
    locked: boolean;
    signals: {
        data: Signal[];
        prev_page_url: string | null;
        next_page_url: string | null;
    };
};

export default function Integrity({ exam, title, policy, locked, signals }: Props) {
    const url = `/examinations/${exam}/integrity`;
    return (
        <main className="portal-page assessment-page">
            <Head title={`Exam conditions · ${title}`} />
            <header className="assessment-heading">
                <p className="portal-kicker">Invigilation · {title}</p>
                <h1 className="portal-title">Exam conditions</h1>
                <p>
                    Set browser controls before the first attempt. These controls cannot verify identity or monitor
                    other devices.
                </p>
            </header>
            {locked ? (
                <section>
                    <h2>Conditions in effect</h2>
                    <p>An attempt has started. Conditions are now fixed for this exam.</p>
                    <p>
                        Page visibility recording: {policy.observe_visibility ? 'on' : 'off'} · Copy restriction:{' '}
                        {policy.prevent_copy ? 'on' : 'off'}
                    </p>
                </section>
            ) : (
                <Post url={url} button="Save exam conditions">
                    <label>
                        <input
                            type="checkbox"
                            name="observe_visibility"
                            value="1"
                            defaultChecked={policy.observe_visibility}
                        />
                        Record when the exam page becomes hidden
                    </label>
                    <label>
                        <input type="checkbox" name="prevent_copy" value="1" defaultChecked={policy.prevent_copy} />
                        Prevent copying from the active exam page
                    </label>
                </Post>
            )}
            <section>
                <h2>Visibility observations</h2>
                <p>
                    Each time shows when the server received the report. If the learner was offline, the page may
                    have become hidden earlier.
                </p>
                <p>
                    A hidden page may mean the learner locked their screen or used an accessibility tool. Review context
                    before drawing conclusions. Marks are never changed here.
                </p>
                {!signals.data.length && <p>No observations recorded.</p>}
                {signals.data.map((s) => (
                    <article key={s.id}>
                        <h3>
                            {s.learner} · Attempt {s.ordinal}
                        </h3>
                        <p>
                            Report received · <time dateTime={s.at}>{new Date(s.at).toLocaleString()}</time>
                        </p>
                        {s.note ? (
                            <p>
                                Reviewed by {s.reviewer}: {s.note}
                            </p>
                        ) : (
                            <Post url={`${url}/signals/${s.id}/review`} button="Record review">
                                <label>
                                    Review note
                                    <textarea name="note" required maxLength={1500} />
                                </label>
                            </Post>
                        )}
                    </article>
                ))}
                <nav aria-label="Observation pages">
                    {signals.prev_page_url && <Link href={signals.prev_page_url}>Previous</Link>}
                    {signals.next_page_url && <Link href={signals.next_page_url}>Next</Link>}
                </nav>
            </section>
        </main>
    );
}
