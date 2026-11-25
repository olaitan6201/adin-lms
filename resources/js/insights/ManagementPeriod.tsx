import { NativeSelect } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Counts, type Measures } from './DeskDetails';
import { LearnerTime } from '../components/LearnerTime';

type Option = { id: string; label: string };
export type Period = { session: string | null; term: string | null; sessions: Option[]; terms: Option[]; summary: Measures };
export type Activity = { from: string; until: string; academic: Measures; latest: { title: string; course: string | null; kind: string; at: string }[]; usage: Measures | null };

export function ManagementPeriod({ period }: { period: Period }) {
    const current = period.term ? `term:${period.term}` : period.session ? `session:${period.session}` : '';
    const [selection, setSelection] = useState(current);
    return <section className="my-5 border-y py-4" aria-label="Academic period">
        <form className="flex flex-wrap items-end gap-3" onSubmit={event => {
            event.preventDefault();
            const [key, id] = selection.split(':');
            router.get('/dashboard', id ? { [key]: id } : {});
        }}>
            <label className="grid w-full min-w-0 gap-1 sm:max-w-md [&>div]:w-full [&>div]:min-w-0">Academic period
                <NativeSelect className="w-full max-w-full" value={selection} onChange={event => setSelection(event.target.value)}>
                    <option value="">All periods</option>
                    <optgroup label="Academic sessions">{period.sessions.map(o => <option key={o.id} value={`session:${o.id}`}>{o.label}</option>)}</optgroup>
                    <optgroup label="Semesters">{period.terms.map(o => <option key={o.id} value={`term:${o.id}`}>{o.label}</option>)}</optgroup>
                </NativeSelect>
            </label>
            <Button type="submit">Apply period</Button>
        </form>
    </section>;
}

export function ActivitySummary({ activity }: { activity: Activity }) {
    return <section className="mt-8 border-t pt-5">
        <h2 className="text-xl font-semibold">Activity in the last seven days</h2>
        <p className="text-sm text-muted-foreground">After <LearnerTime instant={activity.from} /> through <LearnerTime instant={activity.until} />.</p>
        <Counts values={activity.academic} />
        {activity.latest.length > 0 && <><h3>Latest academic activity</h3>
            <ul className="mb-4">{activity.latest.map(row => <li key={row.kind} className="py-1">
                <strong>{row.title}</strong> · {row.course}<br />
                <span className="text-sm text-muted-foreground">{row.kind} · <LearnerTime instant={row.at} /></span>
            </li>)}</ul></>}
        {activity.usage && <><h3>Institution sign-ins</h3><Counts values={activity.usage} />
            <p className="text-sm text-muted-foreground">Accepted password and institutional sign-ins; does not indicate MFA completion.</p></>}
    </section>;
}
