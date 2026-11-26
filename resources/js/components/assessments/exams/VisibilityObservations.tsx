import { ValidatedTextarea } from '@/components/assessments/ValidatedFields';
import { Label } from '@/components/ui/label';
import { Link } from '@inertiajs/react';
import { Post } from '../Post';

type Signal = {
    id: string;
    learner: string;
    ordinal: number;
    at: string;
    note: string | null;
    reviewer: string | null;
};
export type VisibilitySignals = {
    data: Signal[];
    prev_page_url: string | null;
    next_page_url: string | null;
};

export function VisibilityObservations({ signals, url }: { signals: VisibilitySignals; url: string }) {
    return (
        <section className="assessment-panel space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Visibility observations</h2>
            <p>
                Each time shows when the server received the report. If the learner was offline, the page may
                have become hidden earlier.
            </p>
            <p>
                A hidden page may mean the learner locked their screen or used an accessibility tool. Review
                context before drawing conclusions. Marks are never changed here.
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
                {signals.prev_page_url && (
                    <Link className="text-primary underline underline-offset-4" href={signals.prev_page_url}>
                        Previous
                    </Link>
                )}
                {signals.next_page_url && (
                    <Link className="text-primary underline underline-offset-4" href={signals.next_page_url}>
                        Next
                    </Link>
                )}
            </nav>
        </section>
    );
}
