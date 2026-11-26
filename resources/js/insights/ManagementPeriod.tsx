import { NativeSelectOption } from '@/components/ui/native-select';
import { NativeSelect } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Counts, type Measures } from './DeskDetails';
import { LearnerTime } from '../components/LearnerTime';
import { InsightPanel, MeasureBars } from './InsightPanel';

type Option = { id: string; label: string };
export type Period = { session: string | null; term: string | null; sessions: Option[]; terms: Option[]; summary: Measures };
export type Activity = { from: string; until: string; academic: Measures; latest: { title: string; course: string | null; kind: string; at: string }[]; usage: Measures | null };

export function ManagementPeriod({ period }: { period: Period }) {
    const current = period.term ? `term:${period.term}` : period.session ? `session:${period.session}` : '';
    const [selection, setSelection] = useState(current);
    return <section className="card card-pad" aria-label="Academic period">
        <form className="flex flex-wrap items-end gap-3" onSubmit={event => {
            event.preventDefault();
            const [key, id] = selection.split(':');
            router.get('/dashboard', id ? { [key]: id } : {});
        }}>
            <label className="grid w-full min-w-0 gap-1 sm:max-w-md [&>div]:w-full [&>div]:min-w-0">Academic period
                <NativeSelect className="w-full max-w-full" value={selection} onChange={event => setSelection(event.target.value)}>
                    <NativeSelectOption value="">All periods</NativeSelectOption>
                    <optgroup label="Academic sessions">{period.sessions.map(o => <NativeSelectOption key={o.id} value={`session:${o.id}`}>{o.label}</NativeSelectOption>)}</optgroup>
                    <optgroup label="Semesters">{period.terms.map(o => <NativeSelectOption key={o.id} value={`term:${o.id}`}>{o.label}</NativeSelectOption>)}</optgroup>
                </NativeSelect>
            </label>
            <Button type="submit">Apply period</Button>
        </form>
    </section>;
}

export function ActivitySummary({ activity }: { activity: Activity }) {
    return <InsightPanel title="Activity in the last seven days" subtitle={<>After <LearnerTime instant={activity.from} /> through <LearnerTime instant={activity.until} />.</>}>
        <MeasureBars values={activity.academic} />
        {activity.latest.length > 0 && <><h3 className="card-title mt-5 border-t border-ink-100 pt-4">Latest academic activity</h3>
            <ul className="mb-4">{activity.latest.map(row => <li key={row.kind} className="py-1">
                <strong>{row.title}</strong> · {row.course}<br />
                <span className="text-sm text-muted-foreground">{row.kind} · <LearnerTime instant={row.at} /></span>
            </li>)}</ul></>}
        {activity.usage && <><h3 className="card-title mt-5 border-t border-ink-100 pt-4">Institution sign-ins</h3><Counts values={activity.usage} />
            <p className="text-sm text-muted-foreground">Accepted password and institutional sign-ins; does not indicate MFA completion.</p></>}
    </InsightPanel>;
}
