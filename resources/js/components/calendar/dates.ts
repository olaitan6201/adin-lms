export type AgendaDate = {
    title: string;
    context: string;
    at: string;
    kind: string;
    href?: string;
};
export type CalendarTerm = {
    label: string;
    position: number;
    starts_on: string;
    ends_on: string;
};

export function localDate(value: string) {
    return new Date(value.length === 10 ? `${value}T00:00:00` : value);
}

export function eventGroup(event: AgendaDate) {
    if (event.kind === 'Semester') return 'Semester';

    if (event.kind === 'Scheduled class') return 'Teaching';

    if (event.kind.toLowerCase().includes('exam')) return 'Examinations';

    return 'Deadlines';
}

export const tones = {
    Semester: 'bg-ink-100 text-ink-700',
    Teaching: 'bg-brand-50 text-brand-800',
    Examinations: 'bg-rose-50 text-rose-800',
    Deadlines: 'bg-amber-50 text-amber-900',
};

export function termDates(terms: CalendarTerm[]): AgendaDate[] {
    return terms.flatMap(term => [
        { title: `Semester ${term.position} begins`, at: term.starts_on },
        { title: `Semester ${term.position} ends`, at: term.ends_on },
    ].filter(entry => entry.at).map(entry => ({ ...entry, context: term.label, kind: 'Semester' })));
}
