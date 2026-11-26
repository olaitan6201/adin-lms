import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeskHeading } from '@/components/academics/DeskHeading';
import { InsightPanel } from '@/components/overview/InsightPanel';
import { MonthGrid } from '@/components/calendar/MonthGrid';
import { DateList } from '@/components/calendar/DateList';
import { useLocalToday } from '@/components/calendar/useLocalToday';
import { eventGroup, localDate, termDates, type AgendaDate, type CalendarTerm } from '@/components/calendar/dates';

export default function Calendar({ events, terms }: {
    events: AgendaDate[];
    terms: CalendarTerm[];
}) {
    const today = useLocalToday();
    const [offset, setOffset] = useState(0);
    const [filter, setFilter] = useState('All');
    const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const heading = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const institutionalDates = termDates(terms);
    const entries = [...events, ...institutionalDates].sort(
        (a, b) => localDate(a.at).getTime() - localDate(b.at).getTime(),
    );
    const visible = entries.filter((event) => filter === 'All' || eventGroup(event) === filter);
    function inDisplayedMonth(event: AgendaDate) {
        const date = localDate(event.at);
        return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
    }

    const inMonth = visible.filter(inDisplayedMonth);
    const semesterDates = entries.filter((event) => event.kind === 'Semester' && inDisplayedMonth(event));
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const upcoming = visible.filter((event) => localDate(event.at) >= midnight).slice(0, 8);
    return (
        <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
            <Head title="Calendar" />
            <DeskHeading area="Schedule" title="Calendar">
                Dates from your current academic workspace and its semesters.
            </DeskHeading>
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <section aria-label="Monthly calendar" className="card min-w-0">
                    <header className="card-head">
                        <div>
                            <h2 aria-live="polite" className="card-title">
                                {heading}
                            </h2>
                            <p className="card-subtitle">
                                Current agenda and semester dates · Times shown in your time zone
                            </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setOffset(0)}>
                            Today
                        </Button>
                    </header>
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Previous month"
                                onClick={() => setOffset((n) => n - 1)}
                            >
                                <ChevronLeft />
                            </Button>
                            <span className="text-sm font-semibold">{heading}</span>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Next month"
                                onClick={() => setOffset((n) => n + 1)}
                            >
                                <ChevronRight />
                            </Button>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-ink-600">
                            Show
                            <select
                                className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-sm text-ink-800"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                {['All', 'Teaching', 'Examinations', 'Deadlines', 'Semester'].map((value) => (
                                    <option key={value}>{value}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <MonthGrid month={month} events={inMonth} today={today} />
                    <div className="card-pad sm:hidden">
                        <h3 className="mb-3 text-sm font-semibold">Dates in {heading}</h3>
                        <DateList events={inMonth} empty="No matching dates in this month." />
                    </div>
                </section>
                <aside className="space-y-5">
                    <InsightPanel title="Upcoming dates" subtitle="Next eight matching entries, from today onwards">
                        <DateList events={upcoming} empty="No upcoming dates match this view." />
                    </InsightPanel>
                    <InsightPanel title="Key institutional dates" subtitle="Semester boundaries in the displayed month">
                        <DateList
                            events={semesterDates}
                            empty="No semester begins or ends this month in your workspace."
                        />
                    </InsightPanel>
                </aside>
            </div>
        </main>
    );
}
