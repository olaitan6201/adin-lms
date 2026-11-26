import { AssessmentWorkspace } from '../../assessment/AssessmentWorkspace';
import { ValidatedTextarea } from '../../assessment/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Head, Link } from '@inertiajs/react';
import { Post } from '../../assessment/Fields';
import type { IntegrityPolicy } from '../../assessment/IntegrityNotice';

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
        <AssessmentWorkspace>
            <Head title={`Exam conditions · ${title}`} />
            <header className="space-y-3 border-b pb-5">
                <p className="text-sm font-medium text-muted-foreground">Invigilation · {title}</p>
                <h1 className="text-3xl font-semibold tracking-tight">Exam conditions</h1>
                <p>
                    Set browser controls before the first attempt. These controls cannot verify identity or monitor
                    other devices.
                </p>
            </header>
            <div className="assessment-split">
                <div className="assessment-panel">
                    {locked ? (
                        <section className="min-w-0 space-y-3">
                            <h2 className="text-xl font-semibold tracking-tight">Conditions in effect</h2>
                            <p>An attempt has started. Conditions are now fixed for this exam.</p>
                            <p>
                                Page visibility recording: {policy.observe_visibility ? 'on' : 'off'} · Copy restriction:{' '}
                                {policy.prevent_copy ? 'on' : 'off'}
                            </p>
                        </section>
                    ) : (
                        <Post url={url} button="Save exam conditions">
                            <h2 className="font-semibold">Sitting controls</h2>
                            <Label className="flex items-center gap-3 leading-normal">
                                <Checkbox
                                    name="observe_visibility"
                                    value="1"
                                    defaultChecked={policy.observe_visibility}
                                />
                                Record when the exam page becomes hidden
                            </Label>
                            <Label className="flex items-center gap-3 leading-normal">
                                <Checkbox name="prevent_copy" value="1" defaultChecked={policy.prevent_copy} />
                                Prevent copying from the active exam page
                            </Label>
                        </Post>
                    )}
                </div>
                <section className="assessment-panel space-y-3">
                    <h2 className="text-xl font-semibold tracking-tight">Visibility observations</h2>
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
                        <article key={s.id} className="space-y-2 border-t py-4">
                            <h3 className="font-semibold">
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
                                    <Label className="grid min-w-0 gap-2 leading-normal">
                                        Review note
                                        <ValidatedTextarea name="note" required maxLength={1500} />
                                    </Label>
                                </Post>
                            )}
                        </article>
                    ))}
                    <nav aria-label="Observation pages" className="flex flex-wrap gap-x-5 gap-y-2">
                        {signals.prev_page_url && <Link className="text-primary underline underline-offset-4" href={signals.prev_page_url}>Previous</Link>}
                        {signals.next_page_url && <Link className="text-primary underline underline-offset-4" href={signals.next_page_url}>Next</Link>}
                    </nav>
                </section>
            </div>
        </AssessmentWorkspace>
    );
}
