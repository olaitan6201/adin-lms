import { NativeSelectOption } from '@/components/ui/native-select';
import { NativeSelect } from '@/components/ui/native-select';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { type Measures } from './DeskDetails';
export { ActivitySummary } from './ActivitySummary';

type Option = {
    id: string;
    label: string;
};
export type Period = {
    session: string | null;
    term: string | null;
    sessions: Option[];
    terms: Option[];
    summary: Measures;
};
export type Activity = {
    from: string;
    until: string;
    academic: Measures;
    latest: {
        title: string;
        course: string | null;
        kind: string;
        at: string;
    }[];
    usage: Measures | null;
};

export function ManagementPeriod({ period }: { period: Period }) {
    const current = period.term ? `term:${period.term}` : period.session ? `session:${period.session}` : '';
    const [selection, setSelection] = useState(current);
    return (
        <section className="card card-pad" aria-label="Academic period">
            <form
                className="flex flex-wrap items-end gap-3"
                onSubmit={(event) => {
                    event.preventDefault();
                    const [key, id] = selection.split(':');
                    router.get('/dashboard', id ? { [key]: id } : {});
                }}
            >
                <label className="grid w-full min-w-0 gap-1 sm:max-w-md [&>div]:w-full [&>div]:min-w-0">
                    Academic period
                    <NativeSelect
                        className="w-full max-w-full"
                        value={selection}
                        onChange={(event) => setSelection(event.target.value)}
                    >
                        <NativeSelectOption value="">All periods</NativeSelectOption>
                        <optgroup label="Academic sessions">
                            {period.sessions.map((o) => (
                                <NativeSelectOption key={o.id} value={`session:${o.id}`}>
                                    {o.label}
                                </NativeSelectOption>
                            ))}
                        </optgroup>
                        <optgroup label="Semesters">
                            {period.terms.map((o) => (
                                <NativeSelectOption key={o.id} value={`term:${o.id}`}>
                                    {o.label}
                                </NativeSelectOption>
                            ))}
                        </optgroup>
                    </NativeSelect>
                </label>
                <Button type="submit">Apply period</Button>
            </form>
        </section>
    );
}
